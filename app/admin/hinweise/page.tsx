'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import StatusTabs from '@/components/admin/StatusTabs';
import StatusBadge from '@/components/admin/StatusBadge';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Demo Data ──────────────────────────────────────────────────────────────

interface HinweisRow {
  id: number;
  kundenName: string;
  aktenzeichen: string;
  createdAt: string;
  istAnonym: boolean;
  datumVerstoss: string;
  meldeweg: string;
  status: string;
}

const DEMO_DATA: HinweisRow[] = [
  { id: 1, kundenName: 'DRK Kreisverband Aachen e.V.', aktenzeichen: '2026-03-15-AB12CD34', createdAt: '2026-03-15', istAnonym: false, datumVerstoss: '2026-03-10', meldeweg: 'Hinweisgebersystem', status: 'Neu' },
  { id: 2, kundenName: 'DRK Kreisverband Aachen e.V.', aktenzeichen: '2026-03-12-EF56GH78', createdAt: '2026-03-12', istAnonym: true, datumVerstoss: '2026-02-28', meldeweg: 'Email', status: 'InBearbeitung' },
  { id: 3, kundenName: 'Musterfirma GmbH', aktenzeichen: '2026-02-20-IJ90KL12', createdAt: '2026-02-20', istAnonym: false, datumVerstoss: '2026-01-15', meldeweg: 'Telefon', status: 'Abgeschlossen' },
];

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'kundenName', label: 'Kunden Name' },
  { key: 'aktenzeichen', label: 'Aktenzeichen' },
  { key: 'createdAt', label: 'Erstellt' },
  {
    key: 'istAnonym',
    label: 'Anonym',
    render: (row: HinweisRow) => (
      <span style={{ color: row.istAnonym ? 'var(--drk)' : 'var(--success)' }}>
        {row.istAnonym ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  { key: 'datumVerstoss', label: 'Datum Verstoß' },
  { key: 'meldeweg', label: 'Meldeweg' },
  {
    key: 'status',
    label: 'Status',
    render: (row: HinweisRow) => <StatusBadge status={row.status} />,
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function HinweiseOverviewPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    let result = DEMO_DATA;
    if (statusFilter) {
      result = result.filter((h) => h.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (h) =>
          h.kundenName.toLowerCase().includes(term) ||
          h.aktenzeichen.toLowerCase().includes(term) ||
          h.meldeweg.toLowerCase().includes(term),
      );
    }
    return result;
  }, [statusFilter, searchTerm]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Neu: 0, InBearbeitung: 0, Abgeschlossen: 0 };
    for (const h of DEMO_DATA) {
      if (c[h.status] !== undefined) c[h.status]++;
    }
    return c;
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: '#3d5a80' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Übersicht aller Meldungen
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Sie können hier neue Hinweise erfassen und bestehende Hinweise bearbeiten.
            </p>
          </div>
        </div>
        <Link
          href="/admin/hinweise/neu"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 shrink-0"
          style={{ background: '#3d5a80', minHeight: '44px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Neuer Hinweis
        </Link>
      </div>

      {/* Tabs and Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <StatusTabs
          tabs={['Neu', 'InBearbeitung', 'Abgeschlossen']}
          active={statusFilter}
          onChange={setStatusFilter}
          counts={counts}
        />

        <div className="p-4 space-y-3">
          {/* Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <ButtonBar
              buttons={[
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Neu', icon: <PlusIcon />, href: '/admin/hinweise/neu' },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => selectedId && router.push(`/admin/hinweise/${selectedId}`), disabled: !selectedId },
                { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', disabled: !selectedId },
              ]}
            />
          </div>

          {/* Search */}
          {showSearch && (
            <div className="drk-fade-in">
              <input
                type="text"
                className="drk-input"
                placeholder="Suche nach Kundenname, Aktenzeichen, Meldeweg..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Table */}
          <DataTable
            columns={COLUMNS}
            data={filtered}
            pageSize={20}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => router.push(`/admin/hinweise/${row.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
