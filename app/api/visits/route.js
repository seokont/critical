import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATS_FILE = join(process.cwd(), ".visitor-stats", "visits.json");
const STATS_TIME_ZONE = process.env.VISITOR_STATS_TIME_ZONE || "Europe/Kyiv";
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_STORED_DAYS = 45;

let statsQueue = Promise.resolve();

function json(payload, status = 200) {
  return Response.json(payload, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getDateKey(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: STATS_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const values = Object.fromEntries(
      parts.map((part) => [part.type, part.value]),
    );

    return `${values.year}-${values.month}-${values.day}`;
  } catch (error) {
    return date.toISOString().slice(0, 10);
  }
}

function getRecentDateKeys(dayCount) {
  return Array.from({ length: dayCount }, (_, index) =>
    getDateKey(new Date(Date.now() - index * DAY_MS)),
  );
}

function normalizeStats(rawStats) {
  if (!rawStats || typeof rawStats !== "object") {
    return { days: {} };
  }

  const days = rawStats.days && typeof rawStats.days === "object"
    ? rawStats.days
    : {};

  return { days };
}

async function readStats() {
  try {
    const content = await readFile(STATS_FILE, "utf8");
    return normalizeStats(JSON.parse(content));
  } catch (error) {
    if (error.code === "ENOENT") {
      return { days: {} };
    }

    throw error;
  }
}

async function writeStats(stats) {
  await mkdir(dirname(STATS_FILE), { recursive: true });

  const tempFile = `${STATS_FILE}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tempFile, `${JSON.stringify(stats, null, 2)}\n`, "utf8");
  await rename(tempFile, STATS_FILE);
}

function getCounts(stats) {
  const todayKey = getDateKey();
  const weekKeys = getRecentDateKeys(7);
  const daily = Array.isArray(stats.days[todayKey])
    ? stats.days[todayKey].length
    : 0;
  const weekly = weekKeys.reduce((sum, key) => {
    const visitors = stats.days[key];
    return sum + (Array.isArray(visitors) ? visitors.length : 0);
  }, 0);

  return { daily, weekly, todayKey };
}

function hashVisitorId(visitorId) {
  return createHash("sha256").update(visitorId).digest("hex");
}

function pruneOldStats(stats) {
  const allowedKeys = new Set(getRecentDateKeys(MAX_STORED_DAYS));

  Object.keys(stats.days).forEach((key) => {
    if (!allowedKeys.has(key)) {
      delete stats.days[key];
    }
  });
}

function withStatsQueue(task) {
  const run = statsQueue.then(task, task);
  statsQueue = run.catch(() => {});

  return run;
}

export async function GET() {
  const stats = await readStats();

  return json({ ok: true, ...getCounts(stats) });
}

export async function POST(request) {
  let payload = {};

  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const visitorId = String(payload.visitorId ?? "").trim().slice(0, 160);

  if (!visitorId) {
    return json({ ok: false, error: "visitorId is required" }, 400);
  }

  return withStatsQueue(async () => {
    const stats = await readStats();
    const todayKey = getDateKey();
    const visitorHash = hashVisitorId(visitorId);
    const todayVisitors = new Set(
      Array.isArray(stats.days[todayKey]) ? stats.days[todayKey] : [],
    );

    todayVisitors.add(visitorHash);
    stats.days[todayKey] = Array.from(todayVisitors);
    stats.updatedAt = new Date().toISOString();
    pruneOldStats(stats);

    await writeStats(stats);

    return json({ ok: true, ...getCounts(stats) });
  });
}
