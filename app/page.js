import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LandingInteractions } from "./landing-interactions";

function readContentFile(fileName) {
  return readFileSync(join(process.cwd(), "content", fileName), "utf8");
}

export default function HomePage() {
  const landingMarkup = readContentFile("landing.html");
  const structuredData = readContentFile("structured-data.json");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: structuredData }}
      />
      <div dangerouslySetInnerHTML={{ __html: landingMarkup }} />
      <LandingInteractions />
    </>
  );
}
