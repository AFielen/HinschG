import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hilfe – DRK APP_TITEL',
  description: 'Hilfe und häufige Fragen zur DRK-Anwendung.',
};

export default function Hilfe() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="drk-card">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Hilfe & Anleitung</h2>
          <p style={{ color: 'var(--text-light)' }}>
            Hier finden Sie Antworten auf häufige Fragen und eine Anleitung zur Nutzung.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="drk-card">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Häufige Fragen</h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="drk-summary">
                Was ist diese Anwendung?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                APP_BESCHREIBUNG
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                Werden meine Daten gespeichert?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Nein. Diese Anwendung speichert keine Daten auf einem Server. Alle Eingaben
                verbleiben in Ihrem Browser und können jederzeit gelöscht werden.
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                Brauche ich einen Account?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Nein. Die Anwendung funktioniert ohne Registrierung, ohne Login und ohne
                persönliche Daten.
              </p>
            </details>
          </div>
        </div>

        {/* ── Kontakt ── */}
        <div className="drk-card border-l-4" style={{ borderLeftColor: 'var(--drk)' }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text)' }}>Fragen, Feedback oder Fehler gefunden?</h3>
          <p className="text-sm" style={{ color: 'var(--text-light)' }}>
            Wenden Sie sich an den DRK Kreisverband StädteRegion Aachen e.V. — auch bei technischen Fehlern, Bugs oder inhaltlichen Unklarheiten:<br />
            <a href="mailto:digitalisierung@drk-aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
              digitalisierung@drk-aachen.de
            </a>
          </p>
        </div>

        <div className="text-center">
          <Link href="/" style={{ color: 'var(--drk)' }} className="hover:underline text-sm font-semibold">
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
