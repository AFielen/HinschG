import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Seite nicht gefunden – DRK APP_TITEL',
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="drk-card text-center max-w-md">
        <div className="text-6xl mb-4" aria-hidden="true">🔍</div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Seite nicht gefunden</h2>
        <p className="mb-6" style={{ color: 'var(--text-light)' }}>
          Die angeforderte Seite existiert leider nicht.
        </p>
        <Link href="/" className="drk-btn-primary inline-block">
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  );
}
