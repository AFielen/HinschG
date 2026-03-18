'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

// ── Types ──────────────────────────────────────────────────────────────────

interface HinweisRow {
  id: number;
  kundenName: string;
  aktenzeichen: string;
  createdAt: string;
  istAnonym: boolean;
  datumVerstoss: string | null;
  meldeweg: string | null;
  status: string;
}

interface AufgabeRow {
  id: number;
  titel: string;
  hinweisAktenzeichen: string;
  schrittName: string | null;
  faelligBis: string | null;
  bearbeiterName: string | null;
  status: string;
}

interface DashboardStats {
  abgeschlossen: number;
  avgBearbeitungszeit: number;
  inZeitBearbeitet: number;
  letzteWoche: number[];
}

// ── Constants ──────────────────────────────────────────────────────────────

type MainTab = 'workflow' | 'hinweise';
type TaskTab = 'meine' | 'unbearbeitet' | 'nichtZugewiesen' | 'abgeschlossen';
type HinweisFilter = 'Alle' | 'Neu' | 'InBearbeitung' | 'Abgeschlossen';

const HINWEIS_COLUMNS = [
  { key: 'kundenName', label: 'Kunden Name' },
  { key: 'aktenzeichen', label: 'Aktenzeichen' },
  {
    key: 'createdAt',
    label: 'Erstellt',
    render: (row: HinweisRow) => formatDate(row.createdAt),
  },
  {
    key: 'istAnonym',
    label: 'Anonym',
    render: (row: HinweisRow) => (row.istAnonym ? 'Ja' : 'Nein'),
  },
  {
    key: 'datumVerstoss',
    label: 'Datum Verstoß',
    render: (row: HinweisRow) => (row.datumVerstoss ? formatDate(row.datumVerstoss) : '—'),
  },
  {
    key: 'meldeweg',
    label: 'Meldeweg',
    render: (row: HinweisRow) => row.meldeweg ?? '—',
  },
];

const AUFGABE_COLUMNS = [
  { key: 'titel', label: 'Aufgabe' },
  {
    key: 'hinweisAktenzeichen',
    label: 'Aktenzeichen',
    render: (row: AufgabeRow) => row.hinweisAktenzeichen ?? '—',
  },
  {
    key: 'schrittName',
    label: 'Schritt',
    render: (row: AufgabeRow) => row.schrittName ?? '—',
  },
  {
    key: 'faelligBis',
    label: 'Fällig bis',
    render: (row: AufgabeRow) => (row.faelligBis ? formatDate(row.faelligBis) : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: AufgabeRow) => <StatusBadge status={row.status} />,
  },
];

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

// ── Dashboard ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>('workflow');
  const [taskTab, setTaskTab] = useState<TaskTab>('meine');
  const [hinweisFilter, setHinweisFilter] = useState<HinweisFilter>('Alle');
  const [zeitraum, setZeitraum] = useState('7');

  const [stats, setStats] = useState<DashboardStats>({
    abgeschlossen: 0,
    avgBearbeitungszeit: 0,
    inZeitBearbeitet: 0,
    letzteWoche: [0, 0, 0, 0, 0, 0, 0],
  });

  const [hinweise, setHinweise] = useState<HinweisRow[]>([]);
  const [aufgaben, setAufgaben] = useState<AufgabeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, hinweiseRes, aufgabenRes] = await Promise.allSettled([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/hinweise'),
        fetch('/api/admin/aufgaben'),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        setStats(await statsRes.value.json());
      }
      if (hinweiseRes.status === 'fulfilled' && hinweiseRes.value.ok) {
        setHinweise(await hinweiseRes.value.json());
      }
      if (aufgabenRes.status === 'fulfilled' && aufgabenRes.value.ok) {
        setAufgaben(await aufgabenRes.value.json());
      }
    } catch {
      // APIs not yet available — show empty state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredHinweise =
    hinweisFilter === 'Alle'
      ? hinweise
      : hinweise.filter((h) => h.status === hinweisFilter);

  const taskCounts = {
    meine: aufgaben.filter(
      (a) => a.bearbeiterName && a.status !== 'Abgeschlossen',
    ).length,
    unbearbeitet: aufgaben.filter((a) => a.status === 'Offen').length,
    nichtZugewiesen: aufgaben.filter(
      (a) => !a.bearbeiterName && a.status !== 'Abgeschlossen',
    ).length,
    abgeschlossen: aufgaben.filter((a) => a.status === 'Abgeschlossen').length,
  };

  const filteredAufgaben = (() => {
    switch (taskTab) {
      case 'meine':
        return aufgaben.filter(
          (a) => a.bearbeiterName && a.status !== 'Abgeschlossen',
        );
      case 'unbearbeitet':
        return aufgaben.filter((a) => a.status === 'Offen');
      case 'nichtZugewiesen':
        return aufgaben.filter(
          (a) => !a.bearbeiterName && a.status !== 'Abgeschlossen',
        );
      case 'abgeschlossen':
        return aufgaben.filter((a) => a.status === 'Abgeschlossen');
    }
  })();

  const maxBar = Math.max(...stats.letzteWoche, 1);
  const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Hinweisgebersystem Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-light)' }}>
            Übersicht der laufenden Vorgänge
          </p>
        </div>
        <Link
          href="/admin/hinweise/neu"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors self-start"
          style={{ background: '#3d5a80', minHeight: '44px' }}
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Neue Meldung
        </Link>
      </div>

      {/* ── Main Tabs ── */}
      <div
        className="flex gap-1"
        style={{ borderBottom: '2px solid var(--border)' }}
      >
        {(
          [
            { key: 'workflow', label: 'Übersicht Workflow' },
            { key: 'hinweise', label: 'Übersicht Hinweise' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMainTab(tab.key)}
            className="px-4 py-2.5 text-sm font-semibold transition-colors rounded-t-lg"
            style={{
              color: mainTab === tab.key ? '#3d5a80' : 'var(--text-light)',
              borderBottom:
                mainTab === tab.key
                  ? '2px solid #3d5a80'
                  : '2px solid transparent',
              marginBottom: '-2px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab 1: Workflow ── */}
      {mainTab === 'workflow' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard
              label="Abgeschlossen"
              value={String(stats.abgeschlossen)}
              color="#059669"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
            <KpiCard
              label="Ø Bearbeitungszeit"
              value={`${stats.avgBearbeitungszeit} Tage`}
              color="#3d5a80"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <KpiCard
              label="In Zeit bearbeitet"
              value={`${stats.inZeitBearbeitet}%`}
              color="#d97706"
              icon={
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
            />
          </div>

          {/* Bar Chart */}
          <div className="drk-card">
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-sm font-semibold"
                style={{ color: 'var(--text)' }}
              >
                Abgeschlossene Aufgaben der letzten {zeitraum} Tage
              </h3>
              <select
                className="drk-input text-sm"
                style={{ width: 'auto', padding: '0.375rem 0.75rem' }}
                value={zeitraum}
                onChange={(e) => setZeitraum(e.target.value)}
              >
                <option value="7">Letzte 7 Tage</option>
                <option value="30">Letzte 30 Tage</option>
                <option value="90">Letzte 90 Tage</option>
              </select>
            </div>
            <div className="flex items-end gap-2 h-32">
              {stats.letzteWoche.map((val, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {val}
                  </span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${Math.max(4, (val / maxBar) * 100)}%`,
                      background: '#3d5a80',
                      minHeight: '4px',
                    }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {dayLabels[i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Task Tabs */}
          <div className="drk-card">
            <div
              className="flex flex-wrap gap-1 mb-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {(
                [
                  {
                    key: 'meine',
                    label: `Meine zugewiesenen Aufgaben (${taskCounts.meine})`,
                  },
                  {
                    key: 'unbearbeitet',
                    label: `Alle unbearbeiteten Aufgaben (${taskCounts.unbearbeitet})`,
                  },
                  {
                    key: 'nichtZugewiesen',
                    label: `Nicht zugewiesene Aufgaben (${taskCounts.nichtZugewiesen})`,
                  },
                  {
                    key: 'abgeschlossen',
                    label: `Abgeschlossene Aufgaben (${taskCounts.abgeschlossen})`,
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTaskTab(tab.key)}
                  className="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    color:
                      taskTab === tab.key ? '#3d5a80' : 'var(--text-muted)',
                    borderBottom:
                      taskTab === tab.key
                        ? '2px solid #3d5a80'
                        : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <DataTable
              columns={AUFGABE_COLUMNS}
              data={filteredAufgaben}
              loading={loading}
              onRowDoubleClick={(row) =>
                router.push(`/admin/aufgaben/${row.id}`)
              }
              emptyMessage="Keine Aufgaben vorhanden."
            />
          </div>
        </div>
      )}

      {/* ── Tab 2: Hinweise ── */}
      {mainTab === 'hinweise' && (
        <div className="space-y-4">
          {/* Status Filters */}
          <div className="flex gap-1">
            {(
              ['Alle', 'Neu', 'InBearbeitung', 'Abgeschlossen'] as const
            ).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setHinweisFilter(f)}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  background:
                    hinweisFilter === f ? '#3d5a80' : 'var(--bg-secondary)',
                  color:
                    hinweisFilter === f ? '#ffffff' : 'var(--text-light)',
                }}
              >
                {f === 'InBearbeitung' ? 'In Bearbeitung' : f}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <ActionBtn label="Suchen" icon="search" />
            <ActionBtn
              label="Neu"
              icon="plus"
              onClick={() => router.push('/admin/hinweise/neu')}
            />
            <ActionBtn label="Bearbeiten" icon="edit" />
            <ActionBtn label="Löschen" icon="trash" danger />
            <ActionBtn label="Überprüfung starten" icon="play" />
          </div>

          {/* Table */}
          <div className="drk-card">
            <DataTable
              columns={HINWEIS_COLUMNS}
              data={filteredHinweise}
              loading={loading}
              onRowDoubleClick={(row) =>
                router.push(`/admin/hinweise/${row.id}`)
              }
              emptyMessage="Keine Hinweise vorhanden."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="drk-card flex items-center gap-4">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0"
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {value}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {label}
        </p>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
  danger,
}: {
  label: string;
  icon: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  const icons: Record<string, React.ReactNode> = {
    search: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    plus: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    edit: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    trash: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    play: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    ),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
      style={{
        background: danger ? 'var(--error-bg)' : 'var(--bg-secondary)',
        color: danger ? 'var(--error-text)' : 'var(--text)',
        border: `1px solid ${danger ? 'var(--error-border)' : 'var(--border)'}`,
      }}
    >
      {icons[icon]}
      {label}
    </button>
  );
}
