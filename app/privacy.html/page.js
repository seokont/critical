import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LandingInteractions } from "../landing-interactions";

export const metadata = {
  title: "Політика конфіденційності | Критичність",
  description:
    "Політика конфіденційності сайту Критичність: дані, цілі обробки, сервіси передачі, строки зберігання та права користувачів.",
  alternates: {
    canonical: "/privacy.html",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "Критичність",
    title: "Політика конфіденційності",
    description:
      "Як сайт Критичність обробляє контактні, технічні та заявочні дані користувачів.",
  },
  twitter: {
    card: "summary",
    title: "Політика конфіденційності",
    description:
      "Дані, цілі обробки, сервіси передачі, строки зберігання та права користувачів.",
  },
};

function readPrivacyMarkup() {
  const html = readFileSync(join(process.cwd(), "privacy.html"), "utf8");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;

  return body.replace(/\s*<script src="script\.js"><\/script>\s*/i, "");
}

export default function PrivacyHtmlPage() {
  const privacyMarkup = readPrivacyMarkup();

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: privacyMarkup }} />
      <LandingInteractions />
    </>
  );
}
