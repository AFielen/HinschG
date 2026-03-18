'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface VorlageRow {
  id: number;
  templateName: string;
  fromName: string;
  subject: string;
  hasAttachment: boolean;
  createdAt: string;
}

// ── Demo Data ──────────────────────────────────────────────────────────────

const DEMO_DATA: VorlageRow[] = [
  { id: 1, templateName: 'Eingangsbestätigung', fromName: 'Meldestelle', subject: 'Eingangsbestätigung Ihrer Meldung', hasAttachment: false, createdAt: '2026-01-10T10:00:00Z' },
  { id: 2, templateName: 'Statusupdate', fromName: 'Meldestelle', subject: 'Statusaktualisierung zu Ihrer Meldung', hasAttachment: false, createdAt: '2026-01-15T14:00:00Z' },
  { id: 3, templateName: 'Abschlussbericht', fromName: 'Meldestelle', subject: 'Abschlussbericht zu Ihrer Meldung', hasAttachment: true, createdAt: '2026-02-01T09:00:00Z' },
  { id: 4, templateName: 'Rückfrage an Hinweisgeber', fromName: 'Compliance', subject: 'Rückfrage zu Ihrer Meldung', hasAttachment: false, createdAt: '2026-02-10T11:30:00Z' },
];

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'templateName', label: 'Template Name' },
  { key: 'fromName', label: 'From Name' },
  { key: 'subject', label: 'Subject' },
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
    label: 'Created on',
    render: (row: VorlageRow) => new Date(row.createdAt).toLocaleDateString('de-DE'),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function EmailVorlagenPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return DEMO_DATA;
    const term = searchTerm.toLowerCase();
    return DEMO_DATA.filter(
      (v) =>
        v.templateName.toLowerCase().includes(term) ||
        v.subject.toLowerCase().includes(term) ||
        v.fromName.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header with back */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/email"
            className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
            style={{ color: '#3d5a80', background: 'var(--bg-secondary)' }}
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
              { label: 'Neu', icon: <PlusIcon />, onClick: () => {} },
              { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => selectedId && router.push(`/admin/email/vorlagen/${selectedId}`), disabled: !selectedId },
              {
                label: 'Duplizieren',
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                ),
                disabled: !selectedId,
              },
              { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', disabled: !selectedId },
            ]}
          />

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
            pageSize={20}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => router.push(`/admin/email/vorlagen/${row.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
