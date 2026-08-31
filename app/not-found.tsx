import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Seite nicht gefunden – DRK Hinweisgebersystem',
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 py-16"
        style={{ background: 'var(--bg)' }}
      >
        <div className="drk-card text-center max-w-md">
          <div className="flex justify-center mb-4" aria-hidden="true">
            <svg
              width="56"
              height="56"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Seite nicht gefunden</h2>
          <p className="mb-6" style={{ color: 'var(--text-light)' }}>
            Die angeforderte Seite existiert leider nicht.
          </p>
          <Link href="/" className="drk-btn-primary inline-block">
            Zurück zur Startseite
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
