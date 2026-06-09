import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LandingInteractions } from "../landing-interactions";

export const metadata = {
  title: "Угода користувача | Критичність",
  description:
    "Угода користувача сайту Критичність: правила користування сайтом, відправлення заявок, інформаційний характер матеріалів, обмеження відповідальності та контакти.",
  alternates: {
    canonical: "/terms.html",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "Критичність",
    title: "Угода користувача",
    description:
      "Правила користування сайтом, подання заявок та взаємодії з сервісом Критичність.",
  },
  twitter: {
    card: "summary",
    title: "Угода користувача",
    description:
      "Правила сайту, заявки, консультації, відповідальність і порядок оновлення умов.",
  },
};

function readTermsMarkup() {
  const html = readFileSync(join(process.cwd(), "terms.html"), "utf8");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : html;

  return body.replace(/\s*<script src="script\.js"><\/script>\s*/i, "");
}

export default function TermsHtmlPage() {
  const termsMarkup = readTermsMarkup();

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: termsMarkup }} />
      <LandingInteractions />
    </>
  );
}
