'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EmailVorlageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    templateName: '',
    fromName: '',
    subject: '',
    htmlContent: '',
    hasAttachment: false,
  });

  // Load demo data
  useEffect(() => {
    // TODO: fetch from /api/admin/email-vorlagen/[id]
    setForm({
      templateName: 'Eingangsbestätigung',
      fromName: 'Meldestelle',
      subject: 'Eingangsbestätigung Ihrer Meldung',
      htmlContent: '<h1>Eingangsbestätigung</h1>\n<p>Sehr geehrte/r Hinweisgeber/in,</p>\n<p>wir haben Ihre Meldung mit dem Aktenzeichen <strong>{{aktenzeichen}}</strong> erhalten.</p>\n<p>Wir werden Ihre Meldung umgehend prüfen und uns innerhalb von 7 Tagen bei Ihnen melden.</p>\n<p>Mit freundlichen Grüßen<br/>Interne Meldestelle</p>',
      hasAttachment: false,
    });
  }, [id]);

  // Exit guard
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      // TODO: PUT to /api/admin/email-vorlagen/[id]
      router.push('/admin/email/vorlagen');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email/vorlagen"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
            style={{ color: '#3d5a80', background: 'var(--bg-secondary)' }}
            title="Zurück"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Vorlage bearbeiten</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>ID: {id}</p>
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
            style={{ background: '#3d5a80', minHeight: '44px' }}
          >
            {saving ? 'Speichert...' : 'Speichern'}
          </button>
        </div>
      </div>

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
              style={{ accentColor: '#3d5a80' }}
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
