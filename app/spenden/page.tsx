import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unterstützen – DRK APP_TITEL',
  description: 'Unterstützen Sie das Deutsche Rote Kreuz mit einer Spende.',
};

export default function Spenden() {
  return (
    <div className="py-8 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ── Danke Box ── */}
        <div className="drk-card drk-fade-in text-center">
          <div className="text-5xl mb-4" aria-hidden="true">❤️</div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--text)' }}>
            Vielen Dank für Ihre Nutzung!
          </h2>
          <p style={{ color: 'var(--text-light)' }}>
            Diese Anwendung wurde ehrenamtlich entwickelt und wird kostenlos als
            Open-Source-Software zur Verfügung gestellt — für alle DRK-Gliederungen
            und darüber hinaus.
          </p>
        </div>

        {/* ── Über das DRK ── */}
        <div className="drk-card drk-slide-up">
          <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
            Das Deutsche Rote Kreuz
          </h3>
          <p className="mb-4" style={{ color: 'var(--text-light)' }}>
            Der DRK Kreisverband StädteRegion Aachen e.V. engagiert sich in
            zahlreichen Bereichen: Rettungsdienst, Katastrophenschutz,
            Soziale Dienste, Kinder- und Jugendhilfe, Flüchtlingshilfe und
            vieles mehr. Hunderte Ehrenamtliche und Hauptamtliche setzen sich
            täglich für Menschen in Not ein.
          </p>
          <p style={{ color: 'var(--text-light)' }}>
            Mit einer Spende unterstützen Sie diese wichtige Arbeit direkt
            vor Ort in der StädteRegion Aachen.
          </p>
        </div>

        {/* ── Spenden-Optionen ── */}
        <div className="drk-card">
          <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--text)' }}>
            Jetzt unterstützen
          </h3>

          <div className="space-y-5">
            {/* Online-Spende */}
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: 'var(--drk-bg)' }}
              >
                <span className="text-lg" aria-hidden="true">🌐</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  Online spenden
                </p>
                <a
                  href="https://www.drk-aachen.de/spenden"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: 'var(--drk)' }}
                >
                  www.drk-aachen.de/spenden →
                </a>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Bankverbindung */}
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: 'var(--drk-bg)' }}
              >
                <span className="text-lg" aria-hidden="true">🏦</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  Per Überweisung
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                  DRK Kreisverband StädteRegion Aachen e.V.
                </p>
                <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>
                  Bankverbindung: Siehe www.drk-aachen.de/spenden
                </p>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)' }} />

            {/* Mitglied werden */}
            <div className="flex items-start gap-4">
              <div
                className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                style={{ background: 'var(--drk-bg)' }}
              >
                <span className="text-lg" aria-hidden="true">🙋</span>
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--text)' }}>
                  Fördermitglied werden
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                  Mit einer regelmäßigen Fördermitgliedschaft unterstützen Sie
                  das DRK nachhaltig.
                </p>
                <a
                  href="https://www.drk-aachen.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:underline"
                  style={{ color: 'var(--drk)' }}
                >
                  Mehr erfahren →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ── Open Source ── */}
        <div
          className="drk-card"
          style={{ borderLeft: '4px solid var(--info)' }}
        >
          <div className="flex gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">💻</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Open Source
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                Diese Anwendung ist frei verfügbar auf GitHub. Sie können den
                Quellcode einsehen, mitentwickeln oder die App für Ihren eigenen
                DRK-Kreisverband nutzen.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pb-4">
          <Link
            href="/"
            className="text-sm font-semibold hover:underline"
            style={{ color: 'var(--drk)' }}
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
