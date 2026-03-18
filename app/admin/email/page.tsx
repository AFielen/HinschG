'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, TrashIcon } from '@/components/admin/ButtonBar';
import StatusTabs from '@/components/admin/StatusTabs';
import Pagination from '@/components/admin/Pagination';

// ── Types ──────────────────────────────────────────────────────────────────

interface EmailRow {
  id: number;
  von: string;
  an: string;
  betreff: string;
  inhalt: string;
  status: string;
  richtung: string;
  createdAt: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────

const DEMO_EMAILS: EmailRow[] = [
  { id: 1, von: 'meldestelle@drk-aachen.de', an: 'hinweisgeber@example.com', betreff: 'Eingangsbestätigung Ihrer Meldung', inhalt: 'Sehr geehrte/r Hinweisgeber/in,\n\nwir haben Ihre Meldung erhalten und werden diese umgehend prüfen.\n\nMit freundlichen Grüßen\nInterne Meldestelle', status: 'Gesendet', richtung: 'Ausgang', createdAt: '2026-03-15T10:30:00Z' },
  { id: 2, von: 'hinweisgeber@example.com', an: 'meldestelle@drk-aachen.de', betreff: 'Nachricht zu meiner Meldung AZ-2026-03-15', inhalt: 'Ich möchte ergänzende Informationen zu meiner Meldung hinzufügen...', status: 'Gesendet', richtung: 'Eingang', createdAt: '2026-03-16T08:15:00Z' },
  { id: 3, von: 'meldestelle@drk-aachen.de', an: 'bearbeiter@drk-aachen.de', betreff: 'Neue Meldung zur Bearbeitung', inhalt: 'Eine neue Meldung wurde Ihnen zugewiesen. Bitte prüfen Sie den Vorgang.', status: 'Warteschlange', richtung: 'Ausgang', createdAt: '2026-03-17T14:00:00Z' },
  { id: 4, von: 'meldestelle@drk-aachen.de', an: 'invalid@', betreff: 'Benachrichtigung', inhalt: 'Fehler beim Versand', status: 'Fehler', richtung: 'Ausgang', createdAt: '2026-03-17T14:05:00Z' },
];

const DEMO_ACCOUNT = { name: 'Meldestelle', email: 'meldestelle@drk-aachen.de' };

const TAB_MAP: Record<string, string> = {
  Posteingang: 'Eingang',
  Gesendete: 'Gesendet',
  Warteschlange: 'Warteschlange',
  Fehler: 'Fehler',
};

// ── Email list columns ─────────────────────────────────────────────────────

const EMAIL_COLUMNS = [
  {
    key: 'richtung',
    label: 'Art',
    width: '60px',
    render: (row: EmailRow) => (
      <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{
        background: row.richtung === 'Eingang' ? 'var(--info-bg)' : 'var(--success-bg)',
        color: row.richtung === 'Eingang' ? 'var(--info-text)' : 'var(--success)',
      }}>
        {row.richtung === 'Eingang' ? 'IN' : 'OUT'}
      </span>
    ),
  },
  {
    key: 'von',
    label: 'Von',
    render: (row: EmailRow) => (
      <span className="truncate block max-w-[150px]">{row.von}</span>
    ),
  },
  { key: 'betreff', label: 'Betreff' },
  {
    key: 'createdAt',
    label: 'Datum',
    width: '120px',
    render: (row: EmailRow) => new Date(row.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<string>('Posteingang');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  // Compose form state
  const [composeAn, setComposeAn] = useState('');
  const [composeBetreff, setComposeBetreff] = useState('');
  const [composeInhalt, setComposeInhalt] = useState('');

  const filteredEmails = useMemo(() => {
    let filtered = DEMO_EMAILS;
    const tabFilter = TAB_MAP[activeTab];
    if (tabFilter === 'Eingang') {
      filtered = filtered.filter((e) => e.richtung === 'Eingang');
    } else {
      filtered = filtered.filter((e) => e.status === tabFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.betreff.toLowerCase().includes(term) ||
          e.von.toLowerCase().includes(term) ||
          e.an.toLowerCase().includes(term),
      );
    }
    return filtered;
  }, [activeTab, searchTerm]);

  const selectedEmail = DEMO_EMAILS.find((e) => e.id === selectedId);

  const tabCounts: Record<string, number> = {
    Posteingang: DEMO_EMAILS.filter((e) => e.richtung === 'Eingang').length,
    Gesendete: DEMO_EMAILS.filter((e) => e.status === 'Gesendet').length,
    Warteschlange: DEMO_EMAILS.filter((e) => e.status === 'Warteschlange').length,
    Fehler: DEMO_EMAILS.filter((e) => e.status === 'Fehler').length,
  };

  function handleSend() {
    // TODO: POST to /api/admin/emails
    setShowCompose(false);
    setComposeAn('');
    setComposeBetreff('');
    setComposeInhalt('');
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{ background: '#3d5a80' }}
            >
              {DEMO_ACCOUNT.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{DEMO_ACCOUNT.name}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{DEMO_ACCOUNT.email}</div>
            </div>
            <button
              type="button"
              className="ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
              style={{ color: 'var(--text-muted)' }}
              title="Einstellungen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: '#3d5a80' }}
              onClick={() => {}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              E-Mail Konten verwalten
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-opacity hover:opacity-90 opacity-50 cursor-not-allowed"
              style={{ background: '#6b7280' }}
              disabled
            >
              OAuth Konfiguration
            </button>
            <Link
              href="/admin/email/vorlagen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: '#3d5a80' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              Email Vorlagen
            </Link>
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex gap-4" style={{ minHeight: '500px' }}>
        {/* Left panel - Email list */}
        <div className="w-2/5 rounded-xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
          {/* Tabs */}
          <div className="shrink-0">
            <StatusTabs
              tabs={['Posteingang', 'Gesendete', 'Warteschlange', 'Fehler']}
              active={activeTab}
              onChange={(tab) => { setActiveTab(tab || 'Posteingang'); setSelectedId(null); }}
              counts={tabCounts}
            />
          </div>

          {/* Button bar */}
          <div className="p-3 space-y-2 shrink-0">
            <ButtonBar
              buttons={[
                { label: 'Neu', icon: <PlusIcon />, onClick: () => setShowCompose(true) },
                {
                  label: 'Abrufen',
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="23 4 23 10 17 10" />
                      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                  ),
                  onClick: () => {},
                },
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', disabled: !selectedId },
              ]}
            />
            {showSearch && (
              <input
                type="text"
                className="drk-input text-sm"
                placeholder="Suche in E-Mails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            )}
          </div>

          {/* Email list */}
          <div className="flex-1 overflow-auto">
            <DataTable
              columns={EMAIL_COLUMNS}
              data={filteredEmails}
              pageSize={15}
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              emptyMessage="Keine E-Mails vorhanden."
            />
          </div>
        </div>

        {/* Right panel - Email preview */}
        <div className="w-3/5 rounded-xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
          {selectedEmail ? (
            <div className="p-5 space-y-4 overflow-auto flex-1">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selectedEmail.betreff}</h2>
                <div className="mt-2 flex flex-col gap-1 text-sm" style={{ color: 'var(--text-light)' }}>
                  <div><strong>Von:</strong> {selectedEmail.von}</div>
                  <div><strong>An:</strong> {selectedEmail.an}</div>
                  <div><strong>Datum:</strong> {new Date(selectedEmail.createdAt).toLocaleString('de-DE')}</div>
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                      background: selectedEmail.status === 'Gesendet' ? 'var(--success-bg)' : selectedEmail.status === 'Fehler' ? 'var(--error-bg)' : 'var(--warning-bg)',
                      color: selectedEmail.status === 'Gesendet' ? 'var(--success)' : selectedEmail.status === 'Fehler' ? 'var(--error)' : 'var(--warning-dark)',
                    }}>
                      {selectedEmail.status}
                    </span>
                  </div>
                </div>
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                {selectedEmail.inhalt}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center" style={{ color: 'var(--text-muted)' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-30">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <p className="text-sm">Wählen Sie eine E-Mail aus der Liste.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <>
          <div
            className="fixed inset-0 z-40 drk-backdrop-enter"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setShowCompose(false)}
          />
          <div
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-2xl mx-auto rounded-xl drk-fade-in"
            style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)' }}
          >
            <div className="flex items-center justify-between px-5 py-4" style={{ background: '#3d5a80', borderRadius: '0.75rem 0.75rem 0 0' }}>
              <h3 className="text-white font-semibold">Neue E-Mail</h3>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="drk-label">Von</label>
                <select className="drk-input" defaultValue={DEMO_ACCOUNT.email}>
                  <option>{DEMO_ACCOUNT.email}</option>
                </select>
              </div>
              <div>
                <label className="drk-label">An</label>
                <input
                  type="email"
                  className="drk-input"
                  placeholder="empfaenger@example.com"
                  value={composeAn}
                  onChange={(e) => setComposeAn(e.target.value)}
                />
              </div>
              <div>
                <label className="drk-label">Betreff</label>
                <input
                  type="text"
                  className="drk-input"
                  placeholder="Betreff..."
                  value={composeBetreff}
                  onChange={(e) => setComposeBetreff(e.target.value)}
                />
              </div>
              <div>
                <label className="drk-label">Inhalt</label>
                <textarea
                  className="drk-input"
                  rows={8}
                  placeholder="Ihre Nachricht..."
                  value={composeInhalt}
                  onChange={(e) => setComposeInhalt(e.target.value)}
                />
              </div>
              <div>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-90"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-light)' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                  </svg>
                  Anhang (Platzhalter)
                </button>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text)' }}
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: '#3d5a80' }}
                >
                  Senden
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
