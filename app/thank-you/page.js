import Link from "next/link";

export const metadata = {
  title: "Дякуємо за заявку | УкрГосКапітал",
  description:
    "Ми отримали вашу заявку. Наш спеціаліст перевірить інформацію та зв’яжеться з вами.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouPage() {
  return (
    <main className="thank-you-page">
      <section className="thank-you-card" aria-labelledby="thank-you-title">
        <span className="thank-you-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false">
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        </span>
        <p className="section-kicker">Заявку відправлено</p>
        <h1 id="thank-you-title">Дякуємо. Ми отримали вашу заявку.</h1>
        <p>
          Наш спеціаліст перевірить інформацію та зв’яжеться з вами.
        </p>
        <div className="thank-you-actions">
          <Link className="btn btn-primary" href="/">
            На головну
          </Link>
          <a className="btn btn-ghost" href="tel:+380679177889">
            Подзвонити
          </a>
        </div>
      </section>
    </main>
  );
}
