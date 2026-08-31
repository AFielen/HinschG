'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { KATEGORIEN } from '@/lib/kategorien';
import { useT } from '@/components/LocaleProvider';
import type { TranslationKey } from '@/lib/i18n';

interface Kunde {
  id: number;
  firma: string;
}

interface FormData {
  kundeId: string;
  kategorie: string;
  datumVerstoss: string;
  beteiligte: string;
  meldungstext: string;
}

const INITIAL_DATA: FormData = {
  kundeId: '',
  kategorie: '',
  datumVerstoss: '',
  beteiligte: '',
  meldungstext: '',
};

const STEPS: { labelKey: TranslationKey; short: string }[] = [
  { labelKey: 'wiz.step.organisation', short: '1' },
  { labelKey: 'wiz.step.report', short: '2' },
  { labelKey: 'wiz.step.summary', short: '3' },
];

export default function AnonymPage() {
  const t = useT();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_DATA);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [aktenzeichen, setAktenzeichen] = useState('');
  const [zugangscode, setZugangscode] = useState('');
  const [error, setError] = useState('');

  // Organisationsliste (dynamisch von /api/public/kunden)
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [kundenLaden, setKundenLaden] = useState(true);
  const [kundenFehler, setKundenFehler] = useState(false);

  useEffect(() => {
    let aktiv = true;
    void (async () => {
      try {
        const res = await fetch('/api/public/kunden');
        if (!res.ok) throw new Error();
        const rows = (await res.json()) as Kunde[];
        if (aktiv) setKunden(rows);
      } catch {
        if (aktiv) setKundenFehler(true);
      } finally {
        if (aktiv) setKundenLaden(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    if (step === 0) return form.kundeId !== '';
    if (step === 1) return form.meldungstext.trim() !== '';
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
          istAnonym: true,
          kundeId: Number(form.kundeId),
          meldeweg: 'Hinweisgebersystem',
          kategorie: form.kategorie || undefined,
          datumVerstoss: form.datumVerstoss || undefined,
          beteiligte: form.beteiligte || undefined,
          meldungstext: form.meldungstext,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || t('wiz.submitError'));
      }
      const data = await res.json();
      setAktenzeichen(data.aktenzeichen ?? '');
      setZugangscode(data.zugangscode ?? '');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.unknownError'));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="max-w-[800px] mx-auto">
        <div className="rounded-xl p-6 sm:p-8" style={{ background: 'var(--meldestelle-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2" style={{ background: 'var(--success-bg)' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--meldestelle-text)' }}>
              {t('success.titleAnon')}
            </h2>
            <p className="text-[0.9rem]" style={{ color: 'var(--meldestelle-text-body)' }}>
              {t('success.textAnon')}
            </p>
            {aktenzeichen && (
              <div className="rounded-lg p-5 mt-4 text-left" style={{ background: 'var(--warning-bg)', border: '2px solid var(--warning)' }}>
                <div className="flex items-start gap-2 mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning-dark)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                    <path d="M12 9v4" />
                    <path d="M12 17h.01" />
                  </svg>
                  <p className="text-sm font-semibold" style={{ color: 'var(--warning-text)' }}>
                    {t('success.codeWarning')}
                  </p>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--warning-text)' }}>
                      {t('success.aktenzeichen')}
                    </p>
                    <p className="text-lg font-bold font-mono mt-1 break-all" style={{ color: 'var(--meldestelle-text)' }}>
                      {aktenzeichen}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--warning-text)' }}>
                      {t('success.zugangscode')}
                    </p>
                    <p className="text-lg font-bold font-mono mt-1 break-all" style={{ color: 'var(--meldestelle-text)' }}>
                      {zugangscode}
                    </p>
                  </div>
                </div>
                <p className="text-xs mt-4" style={{ color: 'var(--meldestelle-text-muted)' }}>
                  {t('success.hintAnon1')}
                  <Link href="/meldestelle/postfach" className="underline font-semibold" style={{ color: 'var(--meldestelle-accent-text)' }}>
                    {t('success.hintLink')}
                  </Link>
                  {t('success.hintAnon2')}
                </p>
              </div>
            )}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/meldestelle/postfach"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
                style={{ background: 'var(--meldestelle-accent)', minHeight: '44px' }}
              >
                {t('success.toPostfach')}
              </Link>
              <Link
                href="/meldestelle"
                className="drk-btn-secondary inline-flex items-center justify-center gap-2"
              >
                {t('success.backToStart')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto space-y-6">
      {/* ── Anonymous Notice ── */}
      <div className="rounded-lg p-4 flex items-start gap-3" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.9)' }}>
          <span className="font-semibold">{t('wiz.anonNotice.label')}</span>
          {t('wiz.anonNotice.text')}
        </p>
      </div>

      {/* ── Progress Steps ── */}
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        {STEPS.map((s, i) => (
          <div key={s.labelKey} className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => i < step && setStep(i)}
              disabled={i >= step}
              className="flex items-center gap-2"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
                style={{
                  background: i <= step ? 'var(--meldestelle-accent)' : 'rgba(255,255,255,0.3)',
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
                {t(s.labelKey)}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div
                className="w-6 sm:w-10 h-0.5"
                style={{ background: i < step ? 'var(--meldestelle-accent)' : 'rgba(255,255,255,0.3)' }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Form Card ── */}
      <div className="rounded-xl p-6 sm:p-8" style={{ background: 'var(--meldestelle-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
        {/* Step 1: Organisation */}
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--meldestelle-text)' }}>
              {t('wiz.orgTitle')}
            </h2>
            <p className="text-[0.85rem]" style={{ color: 'var(--meldestelle-text-muted)' }}>
              {t('wiz.orgHint')}
            </p>
            <div>
              <label className="drk-label">{t('wiz.orgLabel')} *</label>
              <select
                className="drk-input"
                value={form.kundeId}
                onChange={(e) => update('kundeId', e.target.value)}
                disabled={kundenLaden || kundenFehler}
                required
              >
                <option value="">
                  {kundenLaden ? t('common.loading') : t('common.pleaseSelect')}
                </option>
                {kunden.map((k) => (
                  <option key={k.id} value={String(k.id)}>{k.firma}</option>
                ))}
              </select>
              {kundenFehler && (
                <div
                  className="rounded-lg p-3 text-sm mt-3"
                  style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}
                >
                  {t('wiz.orgLoadError')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Report Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--meldestelle-text)' }}>
              {t('wiz.reportTitle')}
            </h2>
            <p className="text-[0.85rem]" style={{ color: 'var(--meldestelle-text-muted)' }}>
              {t('wiz.reportHintAnon')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="drk-label">{t('wiz.kategorie')}</label>
                <select
                  className="drk-input"
                  value={form.kategorie}
                  onChange={(e) => update('kategorie', e.target.value)}
                >
                  <option value="">{t('common.pleaseSelect')}</option>
                  {KATEGORIEN.map((k) => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="drk-label">{t('wiz.datumVerstoss')}</label>
                <input
                  type="date"
                  className="drk-input"
                  value={form.datumVerstoss}
                  onChange={(e) => update('datumVerstoss', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="drk-label">{t('wiz.beteiligte')}</label>
              <textarea
                className="drk-input"
                rows={3}
                value={form.beteiligte}
                onChange={(e) => update('beteiligte', e.target.value)}
                placeholder={t('wiz.beteiligtePh')}
              />
            </div>
            <div>
              <label className="drk-label">{t('wiz.meldungstext')} *</label>
              <textarea
                className="drk-input"
                rows={6}
                value={form.meldungstext}
                onChange={(e) => update('meldungstext', e.target.value)}
                placeholder={t('wiz.meldungstextPh')}
              />
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold" style={{ color: 'var(--meldestelle-text)' }}>
              {t('wiz.summaryTitle')}
            </h2>
            <p className="text-[0.85rem]" style={{ color: 'var(--meldestelle-text-muted)' }}>
              {t('wiz.summaryHint')}
            </p>

            <div className="rounded-lg p-3 flex items-start gap-2" style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-sm" style={{ color: 'var(--info-text)' }}>
                {t('wiz.anonSummaryNotice')}
              </p>
            </div>

            <div className="space-y-3">
              <SummarySection title={t('wiz.summary.report')}>
                <SummaryRow
                  label={t('wiz.summary.organisation')}
                  value={kunden.find((k) => String(k.id) === form.kundeId)?.firma ?? ''}
                />
                <SummaryRow label={t('wiz.kategorie')} value={form.kategorie} />
                <SummaryRow label={t('wiz.datumVerstoss')} value={form.datumVerstoss} />
                <SummaryRow label={t('wiz.beteiligte')} value={form.beteiligte} />
                <SummaryRow label={t('wiz.meldungstext')} value={form.meldungstext} />
              </SummarySection>
            </div>

            {error && (
              <div className="rounded-lg p-3 text-sm" style={{ background: 'var(--error-bg)', color: 'var(--error-text)', border: '1px solid var(--error-border)' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="drk-btn-secondary flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              {t('common.back')}
            </button>
          ) : (
            <Link
              href="/meldestelle"
              className="drk-btn-secondary flex items-center gap-2"
            >
              {t('common.cancel')}
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'var(--meldestelle-accent)', minHeight: '44px' }}
            >
              {t('common.next')}
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
              style={{ background: 'var(--success)', minHeight: '44px' }}
            >
              {submitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin">
                    <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                  </svg>
                  {t('wiz.submitting')}
                </>
              ) : (
                <>
                  {t('wiz.submit')}
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
    <div className="rounded-lg p-4" style={{ background: 'var(--meldestelle-field)', border: '1px solid var(--meldestelle-field-border)' }}>
      <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--meldestelle-text-body)' }}>{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm">
      <span className="font-medium shrink-0 sm:w-40" style={{ color: 'var(--meldestelle-text-muted)' }}>{label}:</span>
      <span style={{ color: 'var(--meldestelle-text)' }} className="whitespace-pre-wrap">{value}</span>
    </div>
  );
}
