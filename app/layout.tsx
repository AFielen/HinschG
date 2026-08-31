import type { Metadata } from 'next';
import { LocaleProvider } from '@/components/LocaleProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'DRK Hinweisgebersystem',
  description:
    'Digitale Meldestelle nach dem Hinweisgeberschutzgesetz (HinSchG) – DRK Kreisverband StädteRegion Aachen e.V.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('drk-theme');if(t==='dark')document.documentElement.classList.add('dark');else if(t==='light')document.documentElement.classList.add('light');var l=localStorage.getItem('drk-locale');if(l==='en')document.documentElement.lang='en';}catch(e){}})();`,
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

        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
