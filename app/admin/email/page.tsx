'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, TrashIcon } from '@/components/admin/ButtonBar';
import StatusTabs from '@/components/admin/StatusTabs';

// ── Types ──────────────────────────────────────────────────────────────────

interface EmailRow {
  id: number;
  von: string | null;
  an: string | null;
  betreff: string | null;
  inhalt: string | null;
  status: string;
  richtung: string;
  hinweisId: number | null;
  createdAt: string;
}

interface EmailKonto {
  id: number;
  email: string | null;
  active: boolean;
}

const PAGE_SIZE = 15;

// UI-Tab → API-Parameter
const TAB_PARAM: Record<string, string> = {
  Posteingang: 'eingang',
  Gesendete: 'gesendet',
  Warteschlange: 'warteschlange',
  Fehler: 'fehler',
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

// ── Email list columns ─────────────────────────────────────────────────────

const EMAIL_COLUMNS = [
  {
    key: 'richtung',
    label: 'Art',
    width: '60px',
    sortable: false,
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
    key: 'an',
    label: 'An',
    sortable: false,
    render: (row: EmailRow) => (
      <span className="truncate block max-w-[150px]">{row.an ?? '—'}</span>
    ),
  },
  {
    key: 'betreff',
    label: 'Betreff',
    sortable: false,
    render: (row: EmailRow) => row.betreff ?? '—',
  },
  {
    key: 'createdAt',
    label: 'Datum',
    width: '120px',
    sortable: false,
    render: (row: EmailRow) => new Date(row.createdAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState<string>('Posteingang');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<EmailRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);

  const [konten, setKonten] = useState<EmailKonto[]>([]);

  // Compose form state
  const [showCompose, setShowCompose] = useState(false);
  const [composeAn, setComposeAn] = useState('');
  const [composeBetreff, setComposeBetreff] = useState('');
  const [composeInhalt, setComposeInhalt] = useState('');
  const [composeError, setComposeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchEmails = useCallback(async () => {
    setLoading(true);
    setFehler(null);
    try {
      const params = new URLSearchParams({
        tab: TAB_PARAM[activeTab] ?? 'eingang',
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/emails?${params.toString()}`);
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'E-Mails konnten nicht geladen werden.'));
        return;
      }
      const json = await res.json();
      setRows(Array.isArray(json.data) ? json.data : []);
      setTotal(typeof json.total === 'number' ? json.total : 0);
    } catch {
      setFehler('E-Mails konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  // E-Mail-Konten laden (für den Versand über POST /api/admin/emails nötig)
  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/email-konten');
        if (!res.ok) return;
        const json = await res.json();
        if (aktiv && Array.isArray(json)) setKonten(json);
      } catch {
        // Konten optional — Fehlermeldung erscheint beim Senden
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // Suche filtert die geladene Seite clientseitig
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (e) =>
        (e.betreff ?? '').toLowerCase().includes(term) ||
        (e.von ?? '').toLowerCase().includes(term) ||
        (e.an ?? '').toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);

  const selectedEmail = rows.find((e) => e.id === selectedId);

  function handleTabChange(tab: string | null) {
    setActiveTab(tab || 'Posteingang');
    setSelectedId(null);
    setPage(1);
  }

  async function handleDelete() {
    if (!selectedEmail) return;
    if (!window.confirm(`E-Mail „${selectedEmail.betreff ?? selectedEmail.id}“ wirklich löschen?`)) return;

    setFehler(null);
    setErfolg(null);
    try {
      const res = await fetch(`/api/admin/emails/${selectedEmail.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Die E-Mail konnte nicht gelöscht werden.'));
        return;
      }
      setSelectedId(null);
      fetchEmails();
    } catch {
      setFehler('Die E-Mail konnte nicht gelöscht werden.');
    }
  }

  async function handleSend() {
    setComposeError(null);

    if (!composeAn.trim()) {
      setComposeError('Bitte geben Sie eine Empfängeradresse an.');
      return;
    }
    if (!composeBetreff.trim()) {
      setComposeError('Bitte geben Sie einen Betreff an.');
      return;
    }
    if (!composeInhalt.trim()) {
      setComposeError('Bitte geben Sie einen Inhalt an.');
      return;
    }

    const konto = konten.find((k) => k.active) ?? konten[0];

    setSending(true);
    try {
      const body: Record<string, unknown> = {
        an: composeAn.trim(),
        betreff: composeBetreff.trim(),
        inhalt: composeInhalt,
      };
      if (konto) body.kontoId = konto.id;

      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        if (!konto && (res.status === 400 || res.status === 404)) {
          setComposeError('Es ist kein E-Mail-Konto hinterlegt. Der Versand ist derzeit nicht möglich.');
        } else {
          setComposeError(await readErrorMessage(res, 'Die E-Mail konnte nicht in die Warteschlange gestellt werden.'));
        }
        return;
      }
      setShowCompose(false);
      setComposeAn('');
      setComposeBetreff('');
      setComposeInhalt('');
      setErfolg('In Warteschlange gestellt — Versand erfolgt automatisch.');
      fetchEmails();
    } catch {
      setComposeError('Die E-Mail konnte nicht in die Warteschlange gestellt werden.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white"
              style={{ background: 'var(--admin-accent)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--text)' }}>E-Mail-Ausgang</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Versand über die konfigurierte Absenderadresse (MAIL_FROM)
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/email/vorlagen"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--admin-accent)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              Email Vorlagen
            </Link>
          </div>
        </div>
      </div>

      {/* Hinweisbox */}
      <div
        className="rounded-lg px-4 py-3 text-sm"
        style={{ background: 'var(--info-bg)', border: '1px solid var(--border)', color: 'var(--text-light)' }}
      >
        Eingehende E-Mails werden nicht abgerufen — eingehende Kommunikation läuft über das Postfach.
      </div>

      {/* Meldungen */}
      {erfolg && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
          {erfolg}
        </div>
      )}
      {fehler && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}>
          {fehler}
        </div>
      )}

      {/* Main area */}
      <div className="flex flex-col lg:flex-row gap-4" style={{ minHeight: '500px' }}>
        {/* Left panel - Email list */}
        <div className="w-full lg:w-2/5 rounded-xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
          {/* Tabs */}
          <div className="shrink-0">
            <StatusTabs
              tabs={['Posteingang', 'Gesendete', 'Warteschlange', 'Fehler']}
              active={activeTab}
              onChange={handleTabChange}
            />
          </div>

          {/* Button bar */}
          <div className="p-3 space-y-2 shrink-0">
            <ButtonBar
              buttons={[
                { label: 'Neu', icon: <PlusIcon />, onClick: () => { setComposeError(null); setShowCompose(true); } },
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', onClick: handleDelete, disabled: !selectedId },
              ]}
            />
            {showSearch && (
              <input
                type="text"
                className="drk-input text-sm"
                placeholder="Suche in geladenen E-Mails..."
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
              data={filteredRows}
              loading={loading}
              pageSize={PAGE_SIZE}
              selectedId={selectedId}
              onRowClick={(row) => setSelectedId(row.id)}
              totalItems={total}
              page={page}
              onPageChange={(p) => {
                setPage(p);
                setSelectedId(null);
              }}
              emptyMessage="Keine E-Mails vorhanden."
            />
          </div>
        </div>

        {/* Right panel - Email preview */}
        <div className="w-full lg:w-3/5 rounded-xl overflow-hidden flex flex-col" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
          {selectedEmail ? (
            <div className="p-5 space-y-4 overflow-auto flex-1">
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>{selectedEmail.betreff ?? '(ohne Betreff)'}</h2>
                <div className="mt-2 flex flex-col gap-1 text-sm" style={{ color: 'var(--text-light)' }}>
                  <div><strong>Von:</strong> {selectedEmail.von ?? '—'}</div>
                  <div><strong>An:</strong> {selectedEmail.an ?? '—'}</div>
                  <div><strong>Datum:</strong> {new Date(selectedEmail.createdAt).toLocaleString('de-DE')}</div>
                  <div className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{
                      background: selectedEmail.status === 'Gesendet' ? 'var(--success-bg)' : selectedEmail.status === 'Fehler' ? 'var(--error-bg)' : 'var(--warning-bg)',
                      color: selectedEmail.status === 'Gesendet' ? 'var(--success)' : selectedEmail.status === 'Fehler' ? 'var(--drk-dark)' : 'var(--warning-dark)',
                    }}>
                      {selectedEmail.status}
                    </span>
                  </div>
                </div>
              </div>
              <hr style={{ borderColor: 'var(--border)' }} />
              <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                {selectedEmail.inhalt ?? ''}
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
            <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--admin-accent)', borderRadius: '0.75rem 0.75rem 0 0' }}>
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
                <p className="text-sm px-3 py-2 rounded" style={{ background: 'var(--bg)', color: 'var(--text-light)', border: '1px solid var(--border)' }}>
                  Konfigurierte Absenderadresse (MAIL_FROM)
                </p>
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
              {composeError && (
                <p className="text-sm" style={{ color: 'var(--drk)' }}>{composeError}</p>
              )}
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
                  disabled={sending}
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--admin-accent)' }}
                >
                  {sending ? 'Wird gesendet…' : 'Senden'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
