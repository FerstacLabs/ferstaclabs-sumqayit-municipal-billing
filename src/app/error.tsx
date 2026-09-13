"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone-message">
      <h1>Səhifə yüklənmədi</h1>
      <p>Müvəqqəti xəta baş verdi. Yenidən cəhd edin.</p>
      <button className="btn btn-primary" onClick={reset}>
        Yenidən cəhd et
      </button>
    </main>
  );
}
