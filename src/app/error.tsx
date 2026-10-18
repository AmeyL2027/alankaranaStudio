'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log details for debugging without exposing them in the UI.
    console.error('Application rendering error:', error);
  }, [error]);

  return (
    <main className="fallback-shell">
      <section className="panel fallback-card" role="alert">
        <p className="eyebrow">SOMETHING WENT WRONG</p>
        <h1>We couldn't open this page.</h1>
        <p className="muted">Your changes may not have been saved. Please try again.</p>
        <div className="actions">
          <button type="button" className="button" onClick={() => reset()}>
            Try again
          </button>
          <Link className="button secondary" href="/">Back to storefront</Link>
        </div>
      </section>
    </main>
  );
}
