import Link from "next/link";
export default function NotFound() {
  return (
    <main className="standalone-message">
      <span className="eyebrow">404 · SƏHİFƏ TAPILMADI</span>
      <h1>Bu ünvan mövcud deyil.</h1>
      <p>Linki yoxlayın və ya əsas səhifəyə qayıdın.</p>
      <Link href="/" className="btn btn-primary">
        Əsas səhifəyə qayıt
      </Link>
    </main>
  );
}
