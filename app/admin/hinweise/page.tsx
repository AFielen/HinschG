'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import StatusTabs from '@/components/admin/StatusTabs';
import StatusBadge from '@/components/admin/StatusBadge';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface HinweisRow {
  id: number;
  kundeName: string | null;
  aktenzeichen: string;
  createdAt: string;
  istAnonym: boolean;
  kategorie: string | null;
  meldeweg: string | null;
  status: string;
}

const PAGE_SIZE = 20;

// Nur diese Spalten unterstützt die API als Sortierschlüssel
const SORTIERBARE_SPALTEN = ['aktenzeichen', 'status', 'createdAt'];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  {
    key: 'kundeName',
    label: 'Kunden Name',
    sortable: false,
    render: (row: HinweisRow) => row.kundeName ?? '—',
  },
  { key: 'aktenzeichen', label: 'Aktenzeichen' },
  {
    key: 'createdAt',
    label: 'Erstellt',
    render: (row: HinweisRow) => formatDate(row.createdAt),
  },
  {
    key: 'istAnonym',
    label: 'Anonym',
    sortable: false,
    render: (row: HinweisRow) => (
      <span style={{ color: row.istAnonym ? 'var(--drk)' : 'var(--success)' }}>
        {row.istAnonym ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  {
    key: 'kategorie',
    label: 'Kategorie',
    sortable: false,
    render: (row: HinweisRow) => row.kategorie ?? '—',
  },
  {
    key: 'meldeweg',
    label: 'Meldeweg',
    sortable: false,
    render: (row: HinweisRow) => row.meldeweg ?? '—',
  },
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
  const [suche, setSuche] = useState(''); // debounced
  const [showSearch, setShowSearch] = useState(false);
  const [sortKey, setSortKey] = useState<string>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<HinweisRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  // Suchbegriff entprellen
  useEffect(() => {
    const t = setTimeout(() => {
      setSuche(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFehler(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort: sortKey,
        order: sortDir,
      });
      if (statusFilter) params.set('status', statusFilter);
      if (suche) params.set('search', suche);

      const res = await fetch(`/api/admin/hinweise?${params.toString()}`);
      if (!res.ok) {
        setFehler('Hinweise konnten nicht geladen werden.');
        return;
      }
      const json = await res.json();
      setRows(json.data);
      setTotal(json.total);
    } catch {
      setFehler('Hinweise konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [page, sortKey, sortDir, statusFilter, suche]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleStatusChange(status: string | null) {
    setStatusFilter(status);
    setSelectedId(null);
    setPage(1);
  }

  function handleSortChange(key: string, dir: 'asc' | 'desc') {
    if (!SORTIERBARE_SPALTEN.includes(key)) return;
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }

  async function handleDelete() {
    if (!selectedId) return;
    const zeile = rows.find((r) => r.id === selectedId);
    const ok = window.confirm(
      `Hinweis ${zeile?.aktenzeichen ?? selectedId} wirklich unwiderruflich löschen? Alle zugehörigen Nachrichten, Aufgaben und Anhänge werden ebenfalls gelöscht.`,
    );
    if (!ok) return;

    setFehler(null);
    try {
      const res = await fetch(`/api/admin/hinweise/${selectedId}`, { method: 'DELETE' });
      if (res.status === 403) {
        setFehler('Nur Administratoren können Hinweise löschen.');
        return;
      }
      if (!res.ok) {
        setFehler('Der Hinweis konnte nicht gelöscht werden.');
        return;
      }
      setSelectedId(null);
      fetchData();
    } catch {
      setFehler('Der Hinweis konnte nicht gelöscht werden.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: 'var(--admin-accent)' }}>
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
          style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
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
          onChange={handleStatusChange}
        />

        <div className="p-4 space-y-3">
          {/* Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <ButtonBar
              buttons={[
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Neu', icon: <PlusIcon />, href: '/admin/hinweise/neu' },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => selectedId && router.push(`/admin/hinweise/${selectedId}`), disabled: !selectedId },
                { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', onClick: handleDelete, disabled: !selectedId },
              ]}
            />
          </div>

          {/* Fehler */}
          {fehler && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
            >
              {fehler}
            </div>
          )}

          {/* Search */}
          {showSearch && (
            <div className="drk-fade-in">
              <input
                type="text"
                className="drk-input"
                placeholder="Suche nach Aktenzeichen oder Meldungstext..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Table */}
          <DataTable
            columns={COLUMNS}
            data={rows}
            loading={loading}
            pageSize={PAGE_SIZE}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => router.push(`/admin/hinweise/${row.id}`)}
            totalItems={total}
            page={page}
            onPageChange={setPage}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />
        </div>
      </div>
    </div>
  );
}
