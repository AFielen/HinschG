export default function Home() {
  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] py-8 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* ── Hero Box ── */}
        <div className="drk-card drk-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl shrink-0" style={{ background: 'var(--drk-bg)' }}>
              <span className="text-3xl" aria-hidden="true">🛡️</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                APP_TITEL
              </h2>
              <p style={{ color: 'var(--text-light)' }}>
                APP_BESCHREIBUNG – Einfach, digital, DSGVO-konform.
              </p>
            </div>
          </div>
        </div>

        {/* ── Content Box ── */}
        <div className="drk-card drk-slide-up">
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>
            Loslegen
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-light)' }}>
            Hier beginnt die eigentliche App-Logik. Diese Seite durch den
            tatsächlichen Inhalt ersetzen.
          </p>
          <button className="drk-btn-primary">
            Starten
          </button>
        </div>

        {/* ── Info Box (optional) ── */}
        <div className="drk-card border-l-4" style={{ borderLeftColor: 'var(--info)', background: 'var(--info-bg)' }}>
          <div className="flex gap-3">
            <span className="text-xl shrink-0" aria-hidden="true">ℹ️</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Hinweis</p>
              <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
                Dies ist ein Template. Passen Sie diese Seite an die
                Anforderungen Ihrer App an.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
