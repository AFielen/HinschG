import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meldestelle – DRK Hinweisgebersystem',
  description: 'Interne Meldestelle nach dem Hinweisgeberschutzgesetz (HinSchG) – DRK Kreisverband StädteRegion Aachen e.V.',
};

export default function MeldestelleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #4a7a9b 0%, #3d7099 100%)' }}>
      {/* ── Meldestelle Header ── */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3" style={{ background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Link href="/meldestelle" className="flex items-center gap-3">
          {/* Shield/Envelope Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: '#4a7a9b' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <div className="text-[1rem] sm:text-[1.15rem] font-bold leading-tight" style={{ color: '#212529' }}>
              HINWEIS MELDESTELLE
            </div>
            <div className="text-[0.7rem] sm:text-[0.75rem]" style={{ color: '#6b7280' }}>
              DRK Kreisverband StädteRegion Aachen e.V.
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {/* Email icon */}
          <Link
            href="mailto:meldestelle@drk-aachen.de"
            title="E-Mail"
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ color: '#6b7280' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </Link>
          {/* Companies icon */}
          <Link
            href="/meldestelle"
            title="Unternehmen"
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ color: '#6b7280' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
              <path d="M10 6h4" />
              <path d="M10 10h4" />
              <path d="M10 14h4" />
              <path d="M10 18h4" />
            </svg>
          </Link>
          {/* Login icon */}
          <Link
            href="/login"
            title="Anmelden"
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ color: '#6b7280' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" x2="3" y1="12" y2="12" />
            </svg>
          </Link>
          {/* Help icon */}
          <Link
            href="/hilfe"
            title="Hilfe"
            className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
            style={{ color: '#6b7280' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          </Link>
        </nav>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 py-6 sm:py-10 px-4">
        {children}
      </main>

      {/* ── Meldestelle Footer ── */}
      <footer className="py-3 px-4 text-center text-[0.75rem]" style={{ background: '#2d3748', color: '#a0aec0' }}>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/impressum" className="hover:underline" style={{ color: '#a0aec0' }}>
            Impressum
          </Link>
          <Link href="/datenschutz" className="hover:underline" style={{ color: '#a0aec0' }}>
            Datenschutz
          </Link>
          <span>&copy; 2026 - DRK Aachen</span>
        </div>
      </footer>
    </div>
  );
}
