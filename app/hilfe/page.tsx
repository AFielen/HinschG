import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Hilfe – DRK Hinweisgebersystem',
  description: 'Hilfe und häufige Fragen zum DRK Hinweisgebersystem nach HinSchG.',
};

export default function Hilfe() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="drk-card">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Hilfe & Anleitung</h2>
          <p style={{ color: 'var(--text-light)' }}>
            Hier finden Sie Antworten auf häufige Fragen zum Hinweisgebersystem und zur Abgabe
            einer Meldung.
          </p>
        </div>

        {/* ── FAQ ── */}
        <div className="drk-card">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Häufige Fragen</h3>
          <div className="space-y-4">
            <details className="group">
              <summary className="drk-summary">
                Was ist das Hinweisgebersystem?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Das Hinweisgebersystem ist die digitale interne Meldestelle des DRK Kreisverband
                StädteRegion Aachen e.V. nach dem Hinweisgeberschutzgesetz (HinSchG). Über die{' '}
                <Link href="/meldestelle" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Meldestelle
                </Link>{' '}
                können Hinweise auf Rechts- und Regelverstöße abgegeben werden – für den
                Kreisverband und die angeschlossenen Organisationen, die diese Meldestelle als
                gemeinsame interne Meldestelle nutzen.
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                Wer kann melden?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Alle Personen, die im Zusammenhang mit ihrer beruflichen Tätigkeit Informationen
                über Verstöße erlangt haben – insbesondere Mitarbeitende, Auszubildende,
                Praktikanten, ehrenamtlich Tätige, Bewerberinnen und Bewerber sowie ehemalige
                Beschäftigte der angeschlossenen Organisationen. Ein Account oder Login ist für
                die Abgabe einer Meldung nicht erforderlich.
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                Werden meine Daten gespeichert?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Ja. Der Inhalt Ihrer Meldung und – bei einer vertraulichen Meldung – Ihre
                freiwillig angegebenen Kontaktdaten werden verschlüsselt übertragen und in einer
                Datenbank auf Servern in der EU (Deutschland) gespeichert, damit die Meldestelle
                den Hinweis gesetzeskonform bearbeiten und dokumentieren kann. Für angemeldete
                Meldestellen-Bearbeiter wird zusätzlich ein technisch notwendiges Session-Cookie
                gesetzt; für Hinweisgeber werden keine Cookies gesetzt. Details finden Sie in der{' '}
                <Link href="/datenschutz" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Datenschutzerklärung
                </Link>.
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                Kann ich anonym melden?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Ja. Bei einer anonymen Meldung werden keine persönlichen Daten von Ihnen erfasst –
                Ihre Identität bleibt auch der Meldestelle unbekannt. Bitte beachten Sie: Bei
                anonymen Meldungen sind keine Rückfragen möglich. Beschreiben Sie den Sachverhalt
                daher so detailliert wie möglich.
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                Welche Fristen gelten?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Nach dem HinSchG erhalten Sie spätestens nach 7 Tagen eine Bestätigung über den
                Eingang Ihrer Meldung. Innerhalb von 3 Monaten gibt die Meldestelle eine
                Rückmeldung über geplante oder bereits ergriffene Folgemaßnahmen. Bei anonymen
                Meldungen ohne Kontaktmöglichkeit können diese Rückmeldungen nicht zugestellt
                werden.
              </p>
            </details>

            <details className="group">
              <summary className="drk-summary">
                An wen wende ich mich bei technischen Problemen?
              </summary>
              <p className="mt-2 text-sm pl-4" style={{ color: 'var(--text-light)' }}>
                Bei technischen Problemen mit dieser Anwendung (z.&nbsp;B. Fehlermeldungen oder
                Darstellungsfehlern) wenden Sie sich an{' '}
                <a href="mailto:digitalisierung@drk-aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
                  digitalisierung@drk-aachen.de
                </a>
                . Bitte senden Sie an diese Adresse keine inhaltlichen Hinweise – nutzen Sie dafür
                ausschließlich die{' '}
                <Link href="/meldestelle" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Meldestelle
                </Link>{' '}
                oder die dort genannten alternativen Meldewege.
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
