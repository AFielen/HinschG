import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Impressum – DRK APP_TITEL',
  description: 'Impressum des DRK Kreisverband StädteRegion Aachen e.V.',
};

export default function Impressum() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="drk-card">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Impressum</h2>

          <div className="space-y-6" style={{ color: 'var(--text-light)' }}>
            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>Angaben gemäß § 5 TMG</h3>
              <p>
                DRK-Kreisverband Städteregion Aachen e.V.<br />
                Henry-Dunant-Platz 1<br />
                52146 Würselen
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>Vertreten durch</h3>
              <p>Axel Fielen, Vorsitzender des Vorstands</p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>Kontakt</h3>
              <p>
                Telefon: 02405 6039100<br />
                E-Mail:{' '}
                <a href="mailto:Info@DRK-Aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Info@DRK-Aachen.de
                </a>
                <br />
                Web:{' '}
                <a
                  href="https://www.drk-aachen.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--drk)' }}
                  className="hover:underline"
                >
                  www.drk-aachen.de
                </a>
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>Registereintrag</h3>
              <p>
                Registergericht: Amtsgericht Aachen<br />
                Registernummer: VR 4535
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>Umsatzsteuer-ID</h3>
              <p>
                Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
                DE121729631
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>Haftungsausschluss</h3>
              <p>
                Die Inhalte dieser Anwendung wurden mit größtmöglicher Sorgfalt erstellt.
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte übernehmen
                wir jedoch keine Gewähr. Die Nutzung der Inhalte erfolgt auf eigene Gefahr.
              </p>
            </section>
          </div>

          <div className="mt-8">
            <Link href="/" style={{ color: 'var(--drk)' }} className="hover:underline text-sm font-semibold">
              ← Zurück zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
