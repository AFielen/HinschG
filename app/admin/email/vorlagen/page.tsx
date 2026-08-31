'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface VorlageRow {
  id: number;
  templateName: string | null;
  fromName: string | null;
  subject: string | null;
  htmlContent: string | null;
  hasAttachment: boolean;
  createdAt: string;
}

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

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key: 'templateName',
    label: 'Template Name',
    render: (row: VorlageRow) => row.templateName ?? '—',
  },
  {
    key: 'fromName',
    label: 'From Name',
    render: (row: VorlageRow) => row.fromName ?? '—',
  },
  {
    key: 'subject',
    label: 'Subject',
    render: (row: VorlageRow) => row.subject ?? '—',
  },
  {
    key: 'hasAttachment',
    label: 'Attachment',
    width: '100px',
    render: (row: VorlageRow) => (
      <span style={{ color: row.hasAttachment ? 'var(--success)' : 'var(--text-muted)' }}>
        {row.hasAttachment ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  {
    key: 'createdAt',
    label: 'Erstellt',
    render: (row: VorlageRow) => new Date(row.createdAt).toLocaleDateString('de-DE'),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function EmailVorlagenPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [rows, setRows] = useState<VorlageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFehler(null);
    try {
      const res = await fetch('/api/admin/email-vorlagen');
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Vorlagen konnten nicht geladen werden.'));
        return;
      }
      const json = await res.json();
      setRows(Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : []);
    } catch {
      setFehler('Vorlagen konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(
      (v) =>
        (v.templateName ?? '').toLowerCase().includes(term) ||
        (v.subject ?? '').toLowerCase().includes(term) ||
        (v.fromName ?? '').toLowerCase().includes(term),
    );
  }, [rows, searchTerm]);

  async function handleDuplicate() {
    const row = rows.find((r) => r.id === selectedId);
    if (!row) return;

    setFehler(null);
    setErfolg(null);
    try {
      const res = await fetch('/api/admin/email-vorlagen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateName: `${row.templateName ?? 'Vorlage'} (Kopie)`,
          fromName: row.fromName ?? '',
          subject: row.subject ?? '',
          htmlContent: row.htmlContent ?? '',
          hasAttachment: row.hasAttachment,
        }),
      });
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Die Vorlage konnte nicht dupliziert werden.'));
        return;
      }
      setErfolg(`Vorlage „${row.templateName ?? row.id}“ wurde dupliziert.`);
      fetchData();
    } catch {
      setFehler('Die Vorlage konnte nicht dupliziert werden.');
    }
  }

  async function handleDelete() {
    const row = rows.find((r) => r.id === selectedId);
    if (!row) return;
    if (!window.confirm(`Vorlage „${row.templateName ?? row.id}“ wirklich löschen?`)) return;

    setFehler(null);
    setErfolg(null);
    try {
      const res = await fetch(`/api/admin/email-vorlagen/${row.id}`, { method: 'DELETE' });
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Die Vorlage konnte nicht gelöscht werden.'));
        return;
      }
      setSelectedId(null);
      fetchData();
    } catch {
      setFehler('Die Vorlage konnte nicht gelöscht werden.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
            style={{ color: 'var(--admin-accent)', background: 'var(--bg-secondary)' }}
            title="Zurück"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Email Templates</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Vorlagen für automatisierte E-Mails verwalten.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 space-y-3">
          <ButtonBar
            buttons={[
              { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
              { label: 'Neu', icon: <PlusIcon />, onClick: () => router.push('/admin/email/vorlagen/neu') },
              { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => selectedId && router.push(`/admin/email/vorlagen/${selectedId}`), disabled: !selectedId },
              {
                label: 'Duplizieren',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                ),
                onClick: handleDuplicate,
                disabled: !selectedId,
              },
              { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', onClick: handleDelete, disabled: !selectedId },
            ]}
          />

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

          {showSearch && (
            <div className="drk-fade-in">
              <input
                type="text"
                className="drk-input"
                placeholder="Suche nach Template-Name, Subject, From..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          <DataTable
            columns={COLUMNS}
            data={filtered}
            loading={loading}
            pageSize={20}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => router.push(`/admin/email/vorlagen/${row.id}`)}
            emptyMessage="Keine Vorlagen vorhanden."
          />
        </div>
      </div>
    </div>
  );
}
