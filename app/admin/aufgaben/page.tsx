'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

// ── Types ──────────────────────────────────────────────────────────────────

interface AufgabeRow {
  id: number;
  titel: string;
  hinweisAktenzeichen: string;
  schrittName: string | null;
  faelligBis: string | null;
  erstelltAm: string;
  bearbeiterName: string | null;
  status: string;
}

type Tab = 'meine' | 'offen' | 'nichtZugewiesen';

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

// ── Component ──────────────────────────────────────────────────────────────

export default function AufgabenPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('meine');
  const [aufgaben, setAufgaben] = useState<AufgabeRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Inline search filters
  const [filterTitel, setFilterTitel] = useState('');
  const [filterFaellig, setFilterFaellig] = useState('');
  const [filterErstellt, setFilterErstellt] = useState('');
  const [filterBearbeiter, setFilterBearbeiter] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/aufgaben');
      if (res.ok) {
        setAufgaben(await res.json());
      }
    } catch {
      // API not yet available
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const tabCounts = useMemo(
    () => ({
      meine: aufgaben.filter(
        (a) => a.bearbeiterName && a.status !== 'Abgeschlossen',
      ).length,
      offen: aufgaben.filter((a) => a.status === 'Offen').length,
      nichtZugewiesen: aufgaben.filter(
        (a) => !a.bearbeiterName && a.status !== 'Abgeschlossen',
      ).length,
    }),
    [aufgaben],
  );

  const filtered = useMemo(() => {
    let rows: AufgabeRow[];
    switch (tab) {
      case 'meine':
        rows = aufgaben.filter(
          (a) => a.bearbeiterName && a.status !== 'Abgeschlossen',
        );
        break;
      case 'offen':
        rows = aufgaben.filter((a) => a.status === 'Offen');
        break;
      case 'nichtZugewiesen':
        rows = aufgaben.filter(
          (a) => !a.bearbeiterName && a.status !== 'Abgeschlossen',
        );
        break;
    }

    const tl = filterTitel.toLowerCase();
    const bl = filterBearbeiter.toLowerCase();

    return rows.filter((r) => {
      if (tl && !r.titel.toLowerCase().includes(tl)) return false;
      if (bl && !(r.bearbeiterName ?? '').toLowerCase().includes(bl))
        return false;
      if (filterFaellig && r.faelligBis) {
        const d = r.faelligBis.slice(0, 10);
        if (d !== filterFaellig) return false;
      }
      if (filterErstellt && r.erstelltAm) {
        const d = r.erstelltAm.slice(0, 10);
        if (d !== filterErstellt) return false;
      }
      return true;
    });
  }, [aufgaben, tab, filterTitel, filterBearbeiter, filterFaellig, filterErstellt]);

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
      key: 'faelligBis',
      label: 'Fällig bis',
      render: (row: AufgabeRow) =>
        row.faelligBis ? formatDate(row.faelligBis) : '—',
    },
    {
      key: 'erstelltAm',
      label: 'Erstellt am',
      render: (row: AufgabeRow) =>
        row.erstelltAm ? formatDate(row.erstelltAm) : '—',
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

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'meine', label: 'Meine Aufgaben', count: tabCounts.meine },
    { key: 'offen', label: 'Offene Aufgaben', count: tabCounts.offen },
    {
      key: 'nichtZugewiesen',
      label: 'Nicht zugewiesene Aufgaben',
      count: tabCounts.nichtZugewiesen,
    },
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
            onClick={() => setTab(t.key)}
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
            {t.label} ({t.count})
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

        {/* Table */}
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          onRowDoubleClick={(row) => router.push(`/admin/aufgaben/${row.id}`)}
          emptyMessage="Keine Aufgaben vorhanden."
        />
      </div>
    </div>
  );
}
