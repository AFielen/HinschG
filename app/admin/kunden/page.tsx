'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface KundeRow {
  id: number;
  firma: string;
  strasse: string;
  plz: string;
  ort: string;
  firmenEmail: string;
  kundengruppeName: string | null;
  createdAt: string;
}

const PAGE_SIZE = 20;

// Spaltenschlüssel → Sortierschlüssel der API
const SORT_MAP: Record<string, string> = {
  firma: 'firma',
  ort: 'ort',
  plz: 'plz',
  firmenEmail: 'email',
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

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'firma', label: 'Kunden Name' },
  {
    key: 'kundengruppeName',
    label: 'Kunden Gruppe',
    sortable: false,
    render: (row: KundeRow) => row.kundengruppeName ?? '—',
  },
  { key: 'strasse', label: 'Straße', sortable: false },
  { key: 'plz', label: 'PLZ' },
  { key: 'ort', label: 'Ort' },
  { key: 'firmenEmail', label: 'E-Mail' },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function KundenOverviewPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suche, setSuche] = useState(''); // debounced
  const [showSearch, setShowSearch] = useState(false);
  const [sortKey, setSortKey] = useState<string>('firma');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<KundeRow[]>([]);
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
        sort: SORT_MAP[sortKey] ?? 'firma',
        order: sortDir,
      });
      if (suche) params.set('search', suche);

      const res = await fetch(`/api/admin/kunden?${params.toString()}`);
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Kunden konnten nicht geladen werden.'));
        return;
      }
      const json = await res.json();
      setRows(Array.isArray(json.data) ? json.data : []);
      setTotal(typeof json.total === 'number' ? json.total : 0);
    } catch {
      setFehler('Kunden konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [page, sortKey, sortDir, suche]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleSortChange(key: string, dir: 'asc' | 'desc') {
    if (!SORT_MAP[key]) return;
    setSortKey(key);
    setSortDir(dir);
    setPage(1);
  }

  async function handleDelete() {
    if (!selectedId) return;
    const zeile = rows.find((r) => r.id === selectedId);
    const ok = window.confirm(
      `Kunde „${zeile?.firma ?? selectedId}“ wirklich löschen? Zugeordnete Mitarbeiter werden ebenfalls entfernt.`,
    );
    if (!ok) return;

    setFehler(null);
    try {
      const res = await fetch(`/api/admin/kunden/${selectedId}`, { method: 'DELETE' });
      if (res.status === 403) {
        setFehler('Nur für Administratoren.');
        return;
      }
      if (res.status === 409) {
        setFehler(
          await readErrorMessage(
            res,
            'Der Kunde kann nicht gelöscht werden, da noch Meldungen vorhanden sind.',
          ),
        );
        return;
      }
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Der Kunde konnte nicht gelöscht werden.'));
        return;
      }
      setSelectedId(null);
      fetchData();
    } catch {
      setFehler('Der Kunde konnte nicht gelöscht werden.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: 'var(--admin-accent)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Übersicht aller Kunden
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Sie können hier neue Kunden anlegen und bestehende Kunden bearbeiten.
            </p>
          </div>
        </div>
        <Link
          href="/admin/kunden/neu"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 shrink-0"
          style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Neuer Kunde
        </Link>
      </div>

      {/* Table Card */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 space-y-3">
          {/* Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <ButtonBar
              buttons={[
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Neu', icon: <PlusIcon />, href: '/admin/kunden/neu' },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => selectedId && router.push(`/admin/kunden/${selectedId}`), disabled: !selectedId },
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
                placeholder="Suche nach Kundenname, Ort, E-Mail..."
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
            onRowDoubleClick={(row) => router.push(`/admin/kunden/${row.id}`)}
            totalItems={total}
            page={page}
            onPageChange={setPage}
            sortKey={sortKey}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            emptyMessage="Keine Kunden vorhanden."
          />
        </div>
      </div>
    </div>
  );
}
