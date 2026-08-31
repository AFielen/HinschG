'use client';

import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ── Types ──────────────────────────────────────────────────────────────────

interface VorlageFormState {
  templateName: string;
  fromName: string;
  subject: string;
  htmlContent: string;
  hasAttachment: boolean;
}

const EMPTY_FORM: VorlageFormState = {
  templateName: '',
  fromName: '',
  subject: '',
  htmlContent: '',
  hasAttachment: false,
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // Response ohne JSON-Body
  }
  return fallback;
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function EmailVorlageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const isNeu = id === 'neu';

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!isNeu);
  const [dirty, setDirty] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [ladeFehler, setLadeFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState<VorlageFormState>(EMPTY_FORM);

  // Vorlage laden (nur im Edit-Modus)
  useEffect(() => {
    if (isNeu) return;
    let aktiv = true;
    (async () => {
      setLoading(true);
      setLadeFehler(null);
      try {
        const res = await fetch(`/api/admin/email-vorlagen/${id}`);
        if (!aktiv) return;
        if (res.status === 404) {
          setLadeFehler('Vorlage nicht gefunden.');
          return;
        }
        if (!res.ok) {
          setLadeFehler(await readErrorMessage(res, 'Die Vorlage konnte nicht geladen werden.'));
          return;
        }
        const row = await res.json();
        if (!aktiv) return;
        setForm({
          templateName: row.templateName ?? '',
          fromName: row.fromName ?? '',
          subject: row.subject ?? '',
          htmlContent: row.htmlContent ?? '',
          hasAttachment: Boolean(row.hasAttachment),
        });
      } catch {
        if (aktiv) setLadeFehler('Die Vorlage konnte nicht geladen werden.');
      } finally {
        if (aktiv) setLoading(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [id, isNeu]);

  // Exit-Guard nur bei ungespeicherten Änderungen
  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  // Timer beim Verlassen aufräumen
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  function update(field: keyof VorlageFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setFehler(null);

    if (!form.templateName.trim()) {
      setFehler('Bitte geben Sie einen Template-Namen an.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(isNeu ? '/api/admin/email-vorlagen' : `/api/admin/email-vorlagen/${id}`, {
        method: isNeu ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: form.templateName.trim(),
          fromName: form.fromName.trim(),
          subject: form.subject.trim(),
          htmlContent: form.htmlContent,
          hasAttachment: form.hasAttachment,
        }),
      });
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Die Vorlage konnte nicht gespeichert werden.'));
        return;
      }
      setDirty(false);
      setErfolg('Vorlage gespeichert.');
      redirectTimer.current = setTimeout(() => {
        router.push('/admin/email/vorlagen');
      }, 800);
    } catch {
      setFehler('Die Vorlage konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded"
            style={{ background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (ladeFehler) {
    return (
      <div className="drk-card space-y-3">
        <p className="text-sm" style={{ color: 'var(--error-text)' }}>{ladeFehler}</p>
        <Link
          href="/admin/email/vorlagen"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--admin-accent)' }}
        >
          Zurück zur Vorlagenübersicht
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email/vorlagen"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
            style={{ color: 'var(--admin-accent)', background: 'var(--bg-secondary)' }}
            title="Zurück"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {isNeu ? 'Neue Vorlage' : 'Vorlage bearbeiten'}
            </h1>
            {!isNeu && (
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>ID: {id}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/admin/email/vorlagen')}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: '#dc2626', minHeight: '44px' }}
          >
            Abbrechen
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
          >
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

      {/* Meldungen */}
      {erfolg && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
          {erfolg}
        </div>
      )}
      {fehler && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
        >
          {fehler}
        </div>
      )}

      {/* Form */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="drk-label">Template Name *</label>
              <input
                type="text"
                className="drk-input"
                value={form.templateName}
                onChange={(e) => update('templateName', e.target.value)}
                placeholder="Name der Vorlage..."
              />
            </div>
            <div>
              <label className="drk-label">From Name</label>
              <input
                type="text"
                className="drk-input"
                value={form.fromName}
                onChange={(e) => update('fromName', e.target.value)}
                placeholder="Absendername..."
              />
            </div>
          </div>

          <div>
            <label className="drk-label">Subject</label>
            <input
              type="text"
              className="drk-input"
              value={form.subject}
              onChange={(e) => update('subject', e.target.value)}
              placeholder="E-Mail Betreff..."
            />
          </div>

          <div>
            <label className="drk-label">HTML Content</label>
            <textarea
              className="drk-input font-mono text-sm"
              rows={16}
              value={form.htmlContent}
              onChange={(e) => update('htmlContent', e.target.value)}
              placeholder="<html>...</html>"
            />
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Der Inhalt wird aus Sicherheitsgründen nur als Code angezeigt (keine HTML-Vorschau).
              Verfügbare Platzhalter: {'{{aktenzeichen}}'}, {'{{hinweisgeber_name}}'}, {'{{status}}'}, {'{{datum}}'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasAttachment"
              checked={form.hasAttachment}
              onChange={(e) => update('hasAttachment', e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ accentColor: 'var(--admin-accent)' }}
            />
            <label htmlFor="hasAttachment" className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              Has Attachment
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
