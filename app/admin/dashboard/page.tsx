'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

// ── Types ──────────────────────────────────────────────────────────────────

interface HinweisRow {
  id: number;
  kundeName: string | null;
  aktenzeichen: string;
  createdAt: string;
  istAnonym: boolean;
  meldeweg: string | null;
  status: string;
}

interface AufgabeRow {
  id: number;
  titel: string;
  aktenzeichen: string;
  schrittName: string | null;
  faelligBis: string | null;
  bearbeiterName: string | null;
  status: string;
}

interface DashboardStats {
  abgeschlossen: number;
  avgBearbeitungszeit: number;
  inZeitBearbeitet: number;
}

interface ChartBalken {
  label: string;
  value: number;
}

interface FristEintrag {
  hinweisId: number;
  aktenzeichen: string;
  faelligAm: string;
  tageRest: number;
}

interface FristenDaten {
  eingangsbestaetigungOffen: FristEintrag[];
  rueckmeldungUeberfaellig: FristEintrag[];
  rueckmeldungBaldFaellig: FristEintrag[];
}

// ── Constants ──────────────────────────────────────────────────────────────

type MainTab = 'workflow' | 'hinweise';
type TaskTab = 'meine' | 'unbearbeitet' | 'nichtZugewiesen' | 'abgeschlossen';
type HinweisFilter = 'Alle' | 'Neu' | 'InBearbeitung' | 'Abgeschlossen';

const TASK_TAB_PARAM: Record<TaskTab, string> = {
  meine: 'meine',
  unbearbeitet: 'offen',
  nichtZugewiesen: 'nicht-zugewiesen',
  abgeschlossen: 'abgeschlossen',
};

const HINWEIS_COLUMNS = [
  {
    key: 'kundeName',
    label: 'Kunden Name',
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
    render: (row: HinweisRow) => (row.istAnonym ? 'Ja' : 'Nein'),
  },
  {
    key: 'meldeweg',
    label: 'Meldeweg',
    render: (row: HinweisRow) => row.meldeweg ?? '—',
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: HinweisRow) => <StatusBadge status={row.status} />,
  },
];

const AUFGABE_COLUMNS = [
  { key: 'titel', label: 'Aufgabe' },
  {
    key: 'aktenzeichen',
    label: 'Aktenzeichen',
    render: (row: AufgabeRow) => row.aktenzeichen ?? '—',
  },
  {
    key: 'schrittName',
    label: 'Schritt',
    render: (row: AufgabeRow) => row.schrittName ?? '—',
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
    key: 'status',
    label: 'Status',
    render: (row: AufgabeRow) => <StatusBadge status={row.status} />,
  },
];

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

/** Lokaler Datums-Schlüssel im Format YYYY-MM-DD. */
function datumsSchluessel(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const t = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${t}`;
}

const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

/** Chart-Daten aufbereiten: bei 7 Tagen tageweise, sonst wochenweise gebündelt. */
function baueChartBalken(
  rows: { date: string; count: number }[],
  tage: number,
): ChartBalken[] {
  const map = new Map(rows.map((r) => [r.date, r.count]));
  const heute = new Date();

  const taeglich: { datum: Date; value: number }[] = [];
  for (let i = tage - 1; i >= 0; i--) {
    const d = new Date(heute);
    d.setDate(d.getDate() - i);
    taeglich.push({ datum: d, value: map.get(datumsSchluessel(d)) ?? 0 });
  }

  if (tage <= 7) {
    return taeglich.map((t) => ({
      label: WOCHENTAGE[t.datum.getDay()],
      value: t.value,
    }));
  }

  // Wochenweise bündeln (ältester Tag zuerst)
  const balken: ChartBalken[] = [];
  for (let i = 0; i < taeglich.length; i += 7) {
    const gruppe = taeglich.slice(i, i + 7);
    const start = gruppe[0].datum;
    balken.push({
      label: `${String(start.getDate()).padStart(2, '0')}.${String(start.getMonth() + 1).padStart(2, '0')}.`,
      value: gruppe.reduce((sum, t) => sum + t.value, 0),
    });
  }
  return balken;
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
  });
  const [chart, setChart] = useState<ChartBalken[]>([]);
  const [fristen, setFristen] = useState<FristenDaten | null>(null);

  const [hinweise, setHinweise] = useState<HinweisRow[]>([]);
  const [aufgaben, setAufgaben] = useState<AufgabeRow[]>([]);
  const [aufgabenTotal, setAufgabenTotal] = useState(0);
  const [loadingHinweise, setLoadingHinweise] = useState(true);
  const [loadingAufgaben, setLoadingAufgaben] = useState(true);

  // Statistiken + Chart: Zeitraum-Select löst Refetch aus
  const fetchStats = useCallback(async () => {
    const tage = Number(zeitraum);
    try {
      const [statsRes, chartRes] = await Promise.allSettled([
        fetch(`/api/admin/dashboard/stats?timeframe=${tage}`),
        fetch(`/api/admin/dashboard/chart?days=${tage}`),
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
        const json = await statsRes.value.json();
        setStats({
          abgeschlossen: json.completedCount ?? 0,
          avgBearbeitungszeit: json.avgProcessingDays ?? 0,
          inZeitBearbeitet: json.onTimePercentage ?? 0,
        });
      }
      if (chartRes.status === 'fulfilled' && chartRes.value.ok) {
        const rows = await chartRes.value.json();
        setChart(baueChartBalken(rows, tage));
      }
    } catch {
      // Statistiken bleiben leer
    }
  }, [zeitraum]);

  // Fristen-Karte
  const fetchFristen = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard/fristen');
      if (res.ok) setFristen(await res.json());
    } catch {
      // Karte bleibt leer
    }
  }, []);

  // Aufgaben: Tab-Wechsel löst Refetch aus
  const fetchAufgaben = useCallback(async () => {
    setLoadingAufgaben(true);
    try {
      const res = await fetch(`/api/admin/aufgaben?tab=${TASK_TAB_PARAM[taskTab]}&limit=20`);
      if (res.ok) {
        const json = await res.json();
        setAufgaben(json.data);
        setAufgabenTotal(json.total);
      }
    } catch {
      // Liste bleibt leer
    } finally {
      setLoadingAufgaben(false);
    }
  }, [taskTab]);

  // Hinweise: Statusfilter löst Refetch aus
  const fetchHinweise = useCallback(async () => {
    setLoadingHinweise(true);
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (hinweisFilter !== 'Alle') params.set('status', hinweisFilter);
      const res = await fetch(`/api/admin/hinweise?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setHinweise(json.data);
      }
    } catch {
      // Liste bleibt leer
    } finally {
      setLoadingHinweise(false);
    }
  }, [hinweisFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchFristen();
  }, [fetchFristen]);

  useEffect(() => {
    fetchAufgaben();
  }, [fetchAufgaben]);

  useEffect(() => {
    fetchHinweise();
  }, [fetchHinweise]);

  const maxBar = Math.max(...chart.map((b) => b.value), 1);

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
          style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
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
              color: mainTab === tab.key ? 'var(--admin-accent)' : 'var(--text-light)',
              borderBottom:
                mainTab === tab.key
                  ? '2px solid var(--admin-accent)'
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
              color="var(--admin-accent)"
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

          {/* Fristen-Karte */}
          {fristen && <FristenKarte fristen={fristen} />}

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
              {chart.map((balken, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {balken.value}
                  </span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${Math.max(4, (balken.value / maxBar) * 100)}%`,
                      background: 'var(--admin-accent)',
                      minHeight: '4px',
                    }}
                  />
                  <span
                    className="text-xs whitespace-nowrap"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {balken.label}
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
                  { key: 'meine', label: 'Meine zugewiesenen Aufgaben' },
                  { key: 'unbearbeitet', label: 'Alle unbearbeiteten Aufgaben' },
                  { key: 'nichtZugewiesen', label: 'Nicht zugewiesene Aufgaben' },
                  { key: 'abgeschlossen', label: 'Abgeschlossene Aufgaben' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTaskTab(tab.key)}
                  className="px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap"
                  style={{
                    color:
                      taskTab === tab.key ? 'var(--admin-accent)' : 'var(--text-muted)',
                    borderBottom:
                      taskTab === tab.key
                        ? '2px solid var(--admin-accent)'
                        : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.label}
                  {taskTab === tab.key && !loadingAufgaben ? ` (${aufgabenTotal})` : ''}
                </button>
              ))}
            </div>
            <DataTable
              columns={AUFGABE_COLUMNS}
              data={aufgaben}
              loading={loadingAufgaben}
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
                    hinweisFilter === f ? 'var(--admin-accent)' : 'var(--bg-secondary)',
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
            <ActionBtn
              label="Neu"
              icon="plus"
              onClick={() => router.push('/admin/hinweise/neu')}
            />
            <ActionBtn
              label="Alle Hinweise anzeigen"
              icon="list"
              onClick={() => router.push('/admin/hinweise')}
            />
          </div>

          {/* Table */}
          <div className="drk-card">
            <DataTable
              columns={HINWEIS_COLUMNS}
              data={hinweise}
              loading={loadingHinweise}
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

function FristenKarte({ fristen }: { fristen: FristenDaten }) {
  return (
    <div className="drk-card">
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--text)' }}>
        Fristen nach § 17 HinSchG
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <FristenGruppe
          titel="Eingangsbestätigung offen"
          eintraege={fristen.eingangsbestaetigungOffen}
          farbe="#d97706"
        />
        <FristenGruppe
          titel="Rückmeldung überfällig"
          eintraege={fristen.rueckmeldungUeberfaellig}
          farbe="#dc2626"
        />
        <FristenGruppe
          titel="Rückmeldung bald fällig"
          eintraege={fristen.rueckmeldungBaldFaellig}
          farbe="#d97706"
        />
      </div>
    </div>
  );
}

function FristenGruppe({
  titel,
  eintraege,
  farbe,
}: {
  titel: string;
  eintraege: FristEintrag[];
  farbe: string;
}) {
  return (
    <div
      className="rounded-lg px-3.5 py-3"
      style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
          {titel}
        </span>
        <span
          className="inline-flex items-center justify-center min-w-6 h-6 px-1.5 rounded-full text-xs font-bold"
          style={{
            background: eintraege.length > 0 ? `${farbe}20` : 'var(--bg-secondary)',
            color: eintraege.length > 0 ? farbe : 'var(--text-muted)',
          }}
        >
          {eintraege.length}
        </span>
      </div>
      {eintraege.length === 0 ? (
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Keine Einträge.
        </p>
      ) : (
        <ul className="space-y-1">
          {eintraege.slice(0, 5).map((e) => {
            const ueberfaellig = e.tageRest < 0;
            return (
              <li key={e.hinweisId} className="text-xs flex items-center justify-between gap-2">
                <Link
                  href={`/admin/hinweise/${e.hinweisId}`}
                  className={`underline truncate ${ueberfaellig ? 'font-semibold' : ''}`}
                  style={{ color: ueberfaellig ? '#dc2626' : 'var(--admin-accent)' }}
                >
                  {e.aktenzeichen}
                </Link>
                <span
                  className={`shrink-0 ${ueberfaellig ? 'font-semibold' : ''}`}
                  style={{ color: ueberfaellig ? '#dc2626' : 'var(--text-muted)' }}
                >
                  {ueberfaellig
                    ? `${Math.abs(e.tageRest)} Tage überfällig`
                    : `noch ${e.tageRest} Tage`}
                </span>
              </li>
            );
          })}
          {eintraege.length > 5 && (
            <li className="text-xs" style={{ color: 'var(--text-muted)' }}>
              und {eintraege.length - 5} weitere
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

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
}: {
  label: string;
  icon: string;
  onClick?: () => void;
}) {
  const icons: Record<string, React.ReactNode> = {
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
    list: (
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
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
      }}
    >
      {icons[icon]}
      {label}
    </button>
  );
}
