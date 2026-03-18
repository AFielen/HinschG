'use client';

import { useState } from 'react';
import Link from 'next/link';

const KATEGORIEN = [
  'Sexuelle Belästigung',
  'Diskriminierung',
  'Betrug / Untreue',
  'Korruption / Bestechung',
  'Datenschutzverstöße',
  'Arbeitsschutzverstöße',
  'Umweltverstöße',
  'Geldwäsche',
  'Steuerhinterziehung',
  'Verstöße gegen Vergaberecht',
  'Sonstige Verstöße',
];

interface FormData {
  kundeId: string;
  anrede: string;
  vorname: string;
  nachname: string;
  telefon: string;
  email: string;
  kategorie: string;
  datumVerstoss: string;
  beteiligte: string;
  meldungstext: string;
}

const INITIAL_DATA: FormData = {
  kundeId: '',
  anrede: '',
  vorname: '',
  nachname: '',
  telefon: '',
  email: '',
  kategorie: '',
  datumVerstoss: '',
  beteiligte: '',
  meldungstext: '',
};

const STEPS = [
  { label: 'Organisation', short: '1' },
  { label: 'Persönliche Daten', short: '2' },
  { label: 'Meldung', short: '3' },
  { label: 'Zusammenfassung', short: '4' },
];

export default function VertraulichPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aktenzeichen, setAktenzeichen] = useState('');
  const [error, setError] = useState('');

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return form.kundeId !== '';
    if (step === 1) return form.vorname.trim() !== '' && form.nachname.trim() !== '';
    if (step === 2) return form.meldungstext.trim() !== '';
    return true;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/public/hinweis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          istAnonym: false,
          kundeId: Number(form.kundeId),
          meldeweg: 'Hinweisgebersystem',
          kategorie: form.kategorie || undefined,
          datumVerstoss: form.datumVerstoss || undefined,
          beteiligte: form.beteiligte || undefined,
          meldungstext: form.meldungstext,
          hinweisgeberAnrede: form.anrede || undefined,
          hinweisgeberVorname: form.vorname,
          hinweisgeberNachname: form.nachname,
          hinweisgeberTelefon: form.telefon || undefined,
          hinweisgeberEmail: form.email || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Fehler beim Senden der Meldung');
      }
      const data = await res.json();
      setAktenzeichen(data.aktenzeichen ?? '');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-[800px] mx-auto">
        <div className="rounded-xl p-6 sm:p-8" style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2" style={{ background: '#d1fae5' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#212529' }}>
              Meldung erfolgreich übermittelt
            </h2>
            <p className="text-[0.9rem]" style={{ color: '#4a5568' }}>
              Vielen Dank für Ihren Hinweis. Ihre Meldung wurde erfolgreich entgegengenommen und
              wird von unserer Meldestelle vertraulich bearbeitet.
            </p>
            {aktenzeichen && (
              <div className="rounded-lg p-4 mt-4" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                <p className="text-sm font-semibold" style={{ color: '#0369a1' }}>
                  Ihr Aktenzeichen:
                </p>
                <p className="text-lg font-bold font-mono mt-1" style={{ color: '#0c4a6e' }}>
                  {aktenzeichen}
                </p>
                <p className="text-xs mt-2" style={{ color: '#6b7280' }}>
                  Bitte notieren Sie sich dieses Aktenzeichen für Rückfragen.
                </p>
              </div>
            )}
            <div className="pt-4">
              <Link
                href="/meldestelle"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: '#4a7a9b', minHeight: '44px' }}
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* ── Progress Steps ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              className="flex items-center gap-2"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                style={{
                  background: i <= step ? '#4a7a9b' : 'rgba(255,255,255,0.3)',
                  color: i <= step ? '#ffffff' : 'rgba(255,255,255,0.7)',
                }}
              >
                {i < step ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.short
                )}
              </div>
              <span
                className="hidden sm:inline text-sm font-medium"
                style={{ color: i <= step ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
              >
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 sm:w-10 h-0.5"
                style={{ background: i < step ? '#4a7a9b' : 'rgba(255,255,255,0.3)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Form Card ── */}
      <div className="rounded-xl p-6 sm:p-8" style={{ background: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        {/* Step 1: Organisation */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: '#212529' }}>
              Organisation auswählen
            </h2>
            <p className="text-[0.85rem]" style={{ color: '#6b7280' }}>
              Bitte wählen Sie die Organisation aus, zu der Ihre Meldung gehört.
            </p>
            <div>
              <label className="drk-label">Organisation *</label>
              <select
                className="drk-input"
                value={form.kundeId}
                onChange={(e) => update('kundeId', e.target.value)}
              >
                <option value="">Bitte wählen...</option>
                <option value="1">DRK Kreisverband StädteRegion Aachen e.V.</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Personal Data */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: '#212529' }}>
              Persönliche Daten
            </h2>
            <p className="text-[0.85rem]" style={{ color: '#6b7280' }}>
              Ihre Daten werden streng vertraulich behandelt und nur den befugten Mitarbeitern der Meldestelle zugänglich gemacht.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="drk-label">Anrede</label>
                <select
                  className="drk-input"
                  value={form.anrede}
                  onChange={(e) => update('anrede', e.target.value)}
                >
                  <option value="">Bitte wählen...</option>
                  <option value="Frau">Frau</option>
                  <option value="Herr">Herr</option>
                </select>
              </div>
              <div>{/* spacer for grid alignment */}</div>
              <div>
                <label className="drk-label">Vorname *</label>
                <input
                  type="text"
                  className="drk-input"
                  value={form.vorname}
                  onChange={(e) => update('vorname', e.target.value)}
                  placeholder="Ihr Vorname"
                />
              </div>
              <div>
                <label className="drk-label">Nachname *</label>
                <input
                  type="text"
                  className="drk-input"
                  value={form.nachname}
                  onChange={(e) => update('nachname', e.target.value)}
                  placeholder="Ihr Nachname"
                />
              </div>
              <div>
                <label className="drk-label">Telefon</label>
                <input
                  type="tel"
                  className="drk-input"
                  value={form.telefon}
                  onChange={(e) => update('telefon', e.target.value)}
                  placeholder="z.B. 0241 12345"
                />
              </div>
              <div>
                <label className="drk-label">E-Mail</label>
                <input
                  type="email"
                  className="drk-input"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="ihre@email.de"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Report Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: '#212529' }}>
              Meldung erfassen
            </h2>
            <p className="text-[0.85rem]" style={{ color: '#6b7280' }}>
              Beschreiben Sie den Sachverhalt so detailliert wie möglich.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="drk-label">Kategorie</label>
                <select
                  className="drk-input"
                  value={form.kategorie}
                  onChange={(e) => update('kategorie', e.target.value)}
                >
                  <option value="">Bitte wählen...</option>
                  {KATEGORIEN.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="drk-label">Datum des Verstoßes</label>
                <input
                  type="date"
                  className="drk-input"
                  value={form.datumVerstoss}
                  onChange={(e) => update('datumVerstoss', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="drk-label">Beteiligte Personen</label>
              <textarea
                className="drk-input"
                rows={3}
                value={form.beteiligte}
                onChange={(e) => update('beteiligte', e.target.value)}
                placeholder="Welche Personen sind am Sachverhalt beteiligt?"
              />
            </div>
            <div>
              <label className="drk-label">Meldungstext *</label>
              <textarea
                className="drk-input"
                rows={6}
                value={form.meldungstext}
                onChange={(e) => update('meldungstext', e.target.value)}
                placeholder="Beschreiben Sie den Sachverhalt so detailliert wie möglich..."
              />
            </div>
          </div>
        )}

        {/* Step 4: Summary */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: '#212529' }}>
              Zusammenfassung
            </h2>
            <p className="text-[0.85rem]" style={{ color: '#6b7280' }}>
              Bitte überprüfen Sie Ihre Angaben. Nach dem Absenden kann die Meldung nicht mehr geändert werden.
            </p>

            <div className="space-y-3">
              <SummarySection title="Persönliche Daten">
                <SummaryRow label="Anrede" value={form.anrede} />
                <SummaryRow label="Name" value={`${form.vorname} ${form.nachname}`.trim()} />
                <SummaryRow label="Telefon" value={form.telefon} />
                <SummaryRow label="E-Mail" value={form.email} />
              </SummarySection>

              <SummarySection title="Meldung">
                <SummaryRow label="Kategorie" value={form.kategorie} />
                <SummaryRow label="Datum des Verstoßes" value={form.datumVerstoss} />
                <SummaryRow label="Beteiligte" value={form.beteiligte} />
                <SummaryRow label="Meldungstext" value={form.meldungstext} />
              </SummarySection>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm" style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t" style={{ borderColor: '#e5e7eb' }}>
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="drk-btn-secondary flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Zurück
            </button>
          ) : (
            <Link
              href="/meldestelle"
              className="drk-btn-secondary flex items-center gap-2"
            >
              Abbrechen
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: '#4a7a9b', minHeight: '44px' }}
            >
              Weiter
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: '#059669', minHeight: '44px' }}
            >
              {submitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  Wird gesendet...
                </>
              ) : (
                <>
                  Meldung absenden
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SummarySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg p-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
      <h3 className="text-sm font-bold mb-2" style={{ color: '#475569' }}>{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm">
      <span className="font-medium shrink-0 sm:w-40" style={{ color: '#6b7280' }}>{label}:</span>
      <span style={{ color: '#212529' }} className="whitespace-pre-wrap">{value}</span>
    </div>
  );
}
