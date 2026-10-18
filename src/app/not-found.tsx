import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="fallback-shell">
      <section className="panel fallback-card">
        <p className="eyebrow">404 · PAGE NOT FOUND</p>
        <h1>We couldn't find that page.</h1>
        <p className="muted">The link may have changed, or the page may no longer exist.</p>
        <Link className="button" href="/">Return to storefront</Link>
      </section>
    </main>
  );
}
