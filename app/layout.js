import "../style.css";
import Script from "next/script";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
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
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18217009551"
          strategy="beforeInteractive"
        />
        <Script id="google-ads-gtag" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'AW-18217009551');
        `}</Script>
        {/* Google Tag Manager */}
        <Script
          id="gtm-script"
          strategy="beforeInteractive"
        >{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-NTD72C5Z');`}</Script>
        <Script src="/lucide.js" strategy="beforeInteractive" />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-NTD72C5Z"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {children}
        {/*  <script
          src="https://aisw.online/widget.js"
          data-key="sk_7ca0fc9b62a948808eb3249ed11b3e50"
        ></script>*/}
      </body>
    </html>
  );
}
