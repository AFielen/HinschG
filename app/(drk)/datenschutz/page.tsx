import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLanguageNotice from '@/components/LegalLanguageNotice';

export const metadata: Metadata = {
  title: 'Datenschutz – DRK Hinweisgebersystem',
  description: 'Datenschutzerklärung für das Hinweisgebersystem des DRK Kreisverband StädteRegion Aachen e.V.',
};

export default function Datenschutz() {
  return (
    <div style={{ background: 'var(--bg)' }} className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="drk-card">
          <LegalLanguageNotice />
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Datenschutzerklärung</h2>

          <div className="space-y-6" style={{ color: 'var(--text-light)' }}>
            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>1. Verantwortlicher</h3>
              <p>
                DRK Kreisverband StädteRegion Aachen e.V.<br />
                Henry-Dunant-Platz 1, 52146 Würselen<br />
                Telefon: 02405 6039100<br />
                E-Mail:{' '}
                <a href="mailto:Info@DRK-Aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Info@DRK-Aachen.de
                </a>
              </p>
              <p className="mt-2">
                Der DRK Kreisverband StädteRegion Aachen e.V. betreibt dieses Hinweisgebersystem
                als interne Meldestelle nach § 12 HinSchG und zugleich als gemeinsame interne
                Meldestelle nach § 14 Abs. 1 HinSchG auch für die angeschlossenen Organisationen
                und Unternehmen.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>2. Zwecke und Rechtsgrundlagen</h3>
              <p>
                Zweck der Datenverarbeitung ist der Betrieb einer internen Meldestelle nach dem
                Hinweisgeberschutzgesetz (HinSchG): die Entgegennahme von Meldungen, die Prüfung
                des gemeldeten Sachverhalts, die Ergreifung von Folgemaßnahmen sowie die
                gesetzlich vorgeschriebene Dokumentation und Kommunikation mit der hinweisgebenden
                Person.
              </p>
              <p className="mt-2">
                Rechtsgrundlage ist Art. 6 Abs. 1 lit. c DSGVO (Erfüllung einer rechtlichen
                Verpflichtung) in Verbindung mit § 10 HinSchG, der die Meldestelle zur
                Verarbeitung personenbezogener Daten ermächtigt, soweit dies zur Erfüllung ihrer
                Aufgaben erforderlich ist.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>3. Verarbeitete Daten</h3>
              <p>
                Im Rahmen einer Meldung werden verarbeitet:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>der Inhalt der Meldung (Sachverhaltsbeschreibung) und die gewählte Kategorie,</li>
                <li>die betroffene Organisation, an die sich der Hinweis richtet,</li>
                <li>
                  bei einer vertraulichen Meldung: die freiwillig angegebenen Kontaktdaten der
                  hinweisgebenden Person (z.&nbsp;B. Name, E-Mail-Adresse, Telefonnummer),
                </li>
                <li>
                  die Falldokumentation der Meldestelle (Bearbeitungsschritte, Bewertungen,
                  Folgemaßnahmen, Kommunikation).
                </li>
              </ul>
              <p className="mt-2">
                Bei einer anonymen Meldung werden keine personenbezogenen Daten der meldenden
                Person erhoben. Personenbezogene Daten Dritter (z.&nbsp;B. von Personen, die
                Gegenstand der Meldung sind) werden nur verarbeitet, soweit sie im Meldungsinhalt
                enthalten und für die Bearbeitung erforderlich sind.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>4. Cookies</h3>
              <p>
                Diese Anwendung setzt genau ein technisch notwendiges Session-Cookie
                (<code>hinweis-session</code>) – und zwar ausschließlich für angemeldete
                Meldestellen-Bearbeiter nach dem Login. Das Cookie ist httpOnly (nicht per
                JavaScript auslesbar) und läuft nach 24 Stunden ab. Für Hinweisgeber werden keine
                Cookies gesetzt. Es gibt keine Tracking-, Analyse- oder Werbe-Cookies.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>5. Vertraulichkeit</h3>
              <p>
                Die Meldestelle wahrt die Vertraulichkeit der Identität der hinweisgebenden Person,
                der Personen, die Gegenstand einer Meldung sind, und sonstiger in der Meldung
                genannter Personen (§ 8 HinSchG). Zugriff auf Meldungen und Falldokumentation haben
                ausschließlich die befugten, zur Verschwiegenheit verpflichteten
                Meldestellen-Bearbeiter. Die Anwendung selbst erhebt keine IP-Adressen der
                Nutzenden.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>6. Speicherdauer</h3>
              <p>
                Die Dokumentation einer Meldung wird drei Jahre nach Abschluss des Verfahrens
                gelöscht (§ 11 Abs. 5 HinSchG). Eine längere Aufbewahrung erfolgt nur, soweit dies
                zur Erfüllung der Anforderungen des HinSchG oder anderer Rechtsvorschriften
                erforderlich ist, etwa bei laufenden behördlichen oder gerichtlichen Verfahren.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>7. Hosting und eingesetzte Dienstleister</h3>
              <p>
                Die Anwendung und die Datenbank werden bei der Hetzner Online GmbH
                (Gunzenhausen, Deutschland) in Rechenzentren in Deutschland betrieben. Mit Hetzner
                besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO.
              </p>
              <p className="mt-2">
                Für den Versand transaktionaler E-Mails (z.&nbsp;B. Eingangsbestätigungen und
                Benachrichtigungen) wird Mailjet SAS (Paris, Frankreich) mit Servern in der EU
                eingesetzt; auch hierfür besteht ein Auftragsverarbeitungsvertrag.
              </p>
              <p className="mt-2">
                Es werden keine US-Dienste, keine externen Schriftarten, keine CDNs und keine
                Analyse- oder Tracking-Tools eingebunden. Alle Daten verbleiben im EU-Rechtsraum.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>8. Ihre Rechte</h3>
              <p>
                Sie haben nach der DSGVO das Recht auf Auskunft (Art. 15), Berichtigung (Art. 16),
                Löschung (Art. 17) und Einschränkung der Verarbeitung (Art. 18). Außerdem haben Sie
                das Recht, sich bei einer Aufsichtsbehörde zu beschweren – zuständig ist die
                Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen
                (LDI NRW), Kavalleriestraße 2–4, 40213 Düsseldorf,{' '}
                <a
                  href="https://www.ldi.nrw.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--drk)' }}
                  className="hover:underline"
                >
                  www.ldi.nrw.de
                </a>.
              </p>
              <p className="mt-2">
                Bitte beachten Sie: Zum Schutz der Vertraulichkeit der hinweisgebenden Person
                können diese Rechte nach § 29 HinSchG eingeschränkt sein. Insbesondere das
                Auskunftsrecht von Personen, die Gegenstand einer Meldung sind, kann beschränkt
                werden, soweit dies erforderlich ist, um die Identität der hinweisgebenden Person
                zu schützen oder die Bearbeitung der Meldung nicht zu gefährden.
              </p>
            </section>

            <section>
              <h3 className="font-bold mb-2" style={{ color: 'var(--text)' }}>9. Datenschutzbeauftragter und Kontakt</h3>
              <p>
                Bei Fragen zum Datenschutz in dieser Anwendung oder zur Ausübung Ihrer Rechte
                wenden Sie sich an den Verantwortlichen bzw. dessen Datenschutzbeauftragten:
              </p>
              <p className="mt-2">
                DRK Kreisverband StädteRegion Aachen e.V. – Datenschutz<br />
                Henry-Dunant-Platz 1, 52146 Würselen<br />
                E-Mail:{' '}
                <a href="mailto:Info@DRK-Aachen.de" style={{ color: 'var(--drk)' }} className="hover:underline">
                  Info@DRK-Aachen.de
                </a>
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
