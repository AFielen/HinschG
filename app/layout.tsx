import type { Metadata } from 'next';
import Link from 'next/link';
import { RedCrossIcon } from '@/components/icons';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'DRK APP_TITEL',
  description: 'APP_BESCHREIBUNG – DRK Kreisverband StädteRegion Aachen e.V.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('drk-theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.add('light');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* ── Skip-to-Content (Barrierefreiheit) ── */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:rounded"
          style={{ background: 'var(--bg-card)', color: 'var(--drk)' }}
        >
          Zum Inhalt springen
        </a>

        {/* ── DRK Header ── */}
        <Header />

        {/* ── Main Content ── */}
        <main id="main-content" className="flex-1">{children}</main>

        {/* ── DRK Footer ── */}
        <footer
          className="text-center py-10 mt-8 border-t"
          style={{ borderColor: 'var(--border)' }}
        >
          <div
            className="text-sm font-bold uppercase tracking-widest mb-2"
            style={{ color: 'var(--drk)' }}
          >
            Deutsches Rotes Kreuz
          </div>
          <div className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>
            Kreisverband StädteRegion Aachen e.V.
          </div>
          <div className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>
            <Link href="/impressum" className="hover:underline" style={{ color: 'inherit' }}>
              Impressum
            </Link>
            {' · '}
            <Link href="/datenschutz" className="hover:underline" style={{ color: 'inherit' }}>
              Datenschutz
            </Link>
            {' · '}
            <Link href="/hilfe" className="hover:underline" style={{ color: 'inherit' }}>
              Hilfe
            </Link>
            {' · '}
            <Link href="/spenden" className="hover:underline" style={{ color: 'inherit' }}>
              Unterstützen
            </Link>
          </div>
          <div
            className="text-xs flex items-center justify-center gap-1"
            style={{ color: 'var(--text-light)' }}
          >
            made with{' '}
            <span style={{ color: 'var(--drk)' }}>❤</span>{' '}
            for{' '}
            <RedCrossIcon />
          </div>
        </footer>
      </body>
    </html>
  );
}
