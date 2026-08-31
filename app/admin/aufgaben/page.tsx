'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

// ── Types ──────────────────────────────────────────────────────────────────

interface AufgabeRow {
  id: number;
  titel: string;
  aktenzeichen: string;
  schrittName: string | null;
  faelligBis: string | null;
  createdAt: string;
  bearbeiterName: string | null;
  status: string;
}

type Tab = 'meine' | 'offen' | 'nichtZugewiesen';

const TAB_PARAM: Record<Tab, string> = {
  meine: 'meine',
  offen: 'offen',
  nichtZugewiesen: 'nicht-zugewiesen',
};

const PAGE_SIZE = 20;
const TAG_MS = 24 * 60 * 60 * 1000;

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

/** Fälligkeits-Farbe: überfällig rot, in ≤ 3 Tagen fällig gelb. */
function faelligkeitsFarbe(faelligBis: string, erledigt: boolean): string | undefined {
  if (erledigt) return undefined;
  const rest = new Date(faelligBis).getTime() - Date.now();
  if (rest < 0) return '#dc2626';
  if (rest <= 3 * TAG_MS) return '#d97706';
  return undefined;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AufgabenPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('meine');
  const [aufgaben, setAufgaben] = useState<AufgabeRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Inline search filters (filtern die geladene Seite)
  const [filterTitel, setFilterTitel] = useState('');
  const [filterFaellig, setFilterFaellig] = useState('');
  const [filterErstellt, setFilterErstellt] = useState('');
  const [filterBearbeiter, setFilterBearbeiter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tab: TAB_PARAM[tab],
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/admin/aufgaben?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAufgaben(json.data);
        setTotal(json.total);
      }
    } catch {
      // Liste bleibt leer
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    const tl = filterTitel.toLowerCase();
    const bl = filterBearbeiter.toLowerCase();

    return aufgaben.filter((r) => {
      if (tl && !r.titel.toLowerCase().includes(tl)) return false;
      if (bl && !(r.bearbeiterName ?? '').toLowerCase().includes(bl))
        return false;
      if (filterFaellig && r.faelligBis) {
        const d = r.faelligBis.slice(0, 10);
        if (d !== filterFaellig) return false;
      }
      if (filterErstellt && r.createdAt) {
        const d = r.createdAt.slice(0, 10);
        if (d !== filterErstellt) return false;
      }
      return true;
    });
  }, [aufgaben, filterTitel, filterBearbeiter, filterFaellig, filterErstellt]);

  const gefiltert =
    filterTitel || filterBearbeiter || filterFaellig || filterErstellt;

  const columns = [
    {
      key: 'titel',
      label: 'Aufgabe',
      render: (row: AufgabeRow) => (
        <span className="font-medium" style={{ color: 'var(--text)' }}>
          {row.titel}
        </span>
      ),
    },
    {
      key: 'aktenzeichen',
      label: 'Aktenzeichen',
      render: (row: AufgabeRow) => row.aktenzeichen ?? '—',
    },
    {
      key: 'faelligBis',
      label: 'Fällig bis',
      render: (row: AufgabeRow) => {
        if (!row.faelligBis) return '—';
        const farbe = faelligkeitsFarbe(row.faelligBis, row.status === 'Abgeschlossen');
        return (
          <span
            className={farbe ? 'font-semibold' : undefined}
            style={farbe ? { color: farbe } : undefined}
          >
            {formatDate(row.faelligBis)}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Erstellt am',
      render: (row: AufgabeRow) =>
        row.createdAt ? formatDate(row.createdAt) : '—',
    },
    {
      key: 'bearbeiterName',
      label: 'Bearbeiter',
      render: (row: AufgabeRow) => row.bearbeiterName ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: AufgabeRow) => <StatusBadge status={row.status} />,
    },
    {
      key: '_action',
      label: '',
      sortable: false,
      width: '40px',
      render: (row: AufgabeRow) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/admin/aufgaben/${row.id}`);
          }}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          title="Details öffnen"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: 'var(--text-muted)' }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      ),
    },
  ];

  const tabs: { key: Tab; label: string }[] = [
    { key: 'meine', label: 'Meine Aufgaben' },
    { key: 'offen', label: 'Offene Aufgaben' },
    { key: 'nichtZugewiesen', label: 'Nicht zugewiesene Aufgaben' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Aufgaben Übersicht
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
            Übersicht der laufenden Vorgänge
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors self-start"
          style={{
            background: 'var(--bg-secondary)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            minHeight: '44px',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Aktualisieren
        </button>
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1"
        style={{ borderBottom: '2px solid var(--border)' }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className="px-4 py-2.5 text-sm font-semibold transition-colors rounded-t-lg whitespace-nowrap"
            style={{
              color: tab === t.key ? '#3d5a80' : 'var(--text-light)',
              borderBottom:
                tab === t.key
                  ? '2px solid #3d5a80'
                  : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {t.label}
            {tab === t.key && !loading ? ` (${total})` : ''}
          </button>
        ))}
      </div>

      {/* Inline Filters */}
      <div className="drk-card">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Aufgabe
            </label>
            <input
              type="text"
              className="drk-input text-sm"
              placeholder="Suchen…"
              value={filterTitel}
              onChange={(e) => setFilterTitel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Fällig bis
            </label>
            <input
              type="date"
              className="drk-input text-sm"
              value={filterFaellig}
              onChange={(e) => setFilterFaellig(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Erstellt am
            </label>
            <input
              type="date"
              className="drk-input text-sm"
              value={filterErstellt}
              onChange={(e) => setFilterErstellt(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Bearbeiter
            </label>
            <input
              type="text"
              className="drk-input text-sm"
              placeholder="Suchen…"
              value={filterBearbeiter}
              onChange={(e) => setFilterBearbeiter(e.target.value)}
            />
          </div>
        </div>

        {/* Table: bei aktiven Filtern client-seitig, sonst server-seitige Pagination */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          pageSize={PAGE_SIZE}
          onRowDoubleClick={(row) => router.push(`/admin/aufgaben/${row.id}`)}
          emptyMessage="Keine Aufgaben vorhanden."
          totalItems={gefiltert ? undefined : total}
          page={gefiltert ? undefined : page}
          onPageChange={gefiltert ? undefined : setPage}
        />
      </div>
    </div>
  );
}
