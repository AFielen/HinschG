import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Startseite – DRK Hinweisgebersystem',
  description:
    'Digitale Meldestelle nach dem Hinweisgeberschutzgesetz (HinSchG) – vertraulich oder anonym Hinweise auf Rechtsverstöße melden.',
};

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Hero Box ── */}
        <div className="drk-card drk-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl shrink-0" style={{ background: 'var(--drk-bg)' }}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--drk)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                Hinweisgebersystem
              </h2>
              <p style={{ color: 'var(--text-light)' }}>
                Die digitale Meldestelle des DRK Kreisverband StädteRegion Aachen e.V. nach dem
                Hinweisgeberschutzgesetz (HinSchG). Hier können Sie Hinweise auf Rechts- und
                Regelverstöße vertraulich oder anonym abgeben – für den Kreisverband und die
                angeschlossenen Organisationen.
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/meldestelle" className="drk-btn-primary inline-block">
              Zur Meldestelle
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold hover:underline"
              style={{ color: 'var(--drk)' }}
            >
              Anmeldung für Meldestellen-Bearbeiter →
            </Link>
          </div>
        </div>

        {/* ── Info-Karten ── */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="drk-card drk-slide-up">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
              style={{ background: 'var(--drk-bg)' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--drk)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>
              Vertraulich melden
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Ihre Identität wird streng vertraulich behandelt und ist nur den befugten
              Bearbeitern der Meldestelle bekannt. Rückfragen und Rückmeldungen sind möglich.
            </p>
          </div>

          <div className="drk-card drk-slide-up">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
              style={{ background: 'var(--drk-bg)' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--drk)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>
              Anonym melden
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Auf Wunsch melden Sie ganz ohne Angabe persönlicher Daten. Ihre Identität bleibt
              dann auch der Meldestelle vollständig unbekannt.
            </p>
          </div>

          <div className="drk-card drk-slide-up">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-xl mb-3"
              style={{ background: 'var(--drk-bg)' }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--drk)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>
              Gesetzlicher Schutz
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-light)' }}>
              Das Hinweisgeberschutzgesetz schützt Sie vor Repressalien wie Kündigung oder
              Benachteiligung, wenn Sie in gutem Glauben einen Verstoß melden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
