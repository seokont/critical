export const runtime = "nodejs";

function cleanText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 1200);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function json(payload, status = 200) {
  return Response.json(payload, { status });
}

export async function POST(request) {
  const botToken = cleanText(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = cleanText(process.env.TELEGRAM_CHAT_ID);

  if (!botToken || !chatId) {
    return json({ ok: false, error: "Telegram bot is not configured" }, 500);
  }

  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const title = cleanText(payload.title || "New lead");
  const page = cleanText(payload.page);
  const fields =
    payload.fields && typeof payload.fields === "object" ? payload.fields : {};
  const messageLines = [`<b>${escapeHtml(title)}</b>`, ""];

  Object.entries(fields).forEach(([label, value]) => {
    const cleanLabel = cleanText(label);
    const cleanValue = cleanText(value);

    if (!cleanLabel || !cleanValue) {
      return;
    }

    messageLines.push(
      `<b>${escapeHtml(cleanLabel)}:</b> ${escapeHtml(cleanValue)}`,
    );
  });

  if (page) {
    messageLines.push("", `<b>Page:</b> ${escapeHtml(page)}`);
  }

  messageLines.push(`<b>Time:</b> ${new Date().toISOString()}`);

  let telegramResponse;
  let telegramData = {};

  try {
    telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageLines.join("\n"),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );
    telegramData = await telegramResponse.json().catch(() => ({}));
  } catch (error) {
    return json({ ok: false, error: "Telegram request failed" }, 502);
  }

  if (!telegramResponse.ok || telegramData.ok !== true) {
    return json(
      {
        ok: false,
        error: telegramData.description || "Telegram request failed",
      },
      502,
    );
  }

  return json({ ok: true });
}

export function GET() {
  return json({ ok: false, error: "Method not allowed" }, 405);
}
