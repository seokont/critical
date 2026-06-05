import "../style.css";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title:
    "Статус критично важливого підприємства | Супровід для бронювання працівників",
  description:
    "Отримання, підтвердження або відновлення статусу критично важливого підприємства: аудит, документи, обґрунтування і супровід до рішення.",
  authors: [{ name: "Критичність" }],
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "oY47iZQYTmKGzGdYYmJL7Tx6sK_0rni-dfoSLxV6ipQ",
  },
  alternates: {
    canonical: "/",
    languages: {
      "uk-UA": "/",
    },
  },
  icons: {
    icon: "/cropped-cropped-ukrlaw-logo-26-rgrlyvue37wzqo06bbrk80967zr4x8oaytt4m2cvk4.png",
  },
  openGraph: {
    type: "website",
    locale: "uk_UA",
    siteName: "Критичність",
    title: "Статус критично важливого підприємства",
    description:
      "Юридичний супровід отримання, підтвердження або відновлення статусу для підготовки до бронювання ключових працівників.",
  },
  twitter: {
    card: "summary",
    title: "Статус критично важливого підприємства",
    description:
      "Аудит компанії, стратегія подання, документи, юридичне обґрунтування і супровід до рішення.",
  },
};

export const viewport = {
  themeColor: "#071f49",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
