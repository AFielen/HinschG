'use client';

import { useState, useMemo } from 'react';
import Pagination from './Pagination';

// ── Types ──────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T) => void;
  selectedId?: number | null;
  emptyMessage?: string;
  loading?: boolean;
  /** Server-seitige Pagination: Gesamtanzahl aller Zeilen (data enthält nur die aktuelle Seite). */
  totalItems?: number;
  /** Server-seitige Pagination: aktuelle Seite (1-basiert), zusammen mit onPageChange. */
  page?: number;
  onPageChange?: (page: number) => void;
  /** Server-seitige Sortierung: aktueller Sortierschlüssel und Richtung, zusammen mit onSortChange. */
  sortKey?: string | null;
  sortDir?: SortDir;
  onSortChange?: (key: string, dir: SortDir) => void;
}

type SortDir = 'asc' | 'desc';

// ── Component ──────────────────────────────────────────────────────────────

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  pageSize = 20,
  onRowClick,
  onRowDoubleClick,
  selectedId,
  emptyMessage = 'Keine Einträge vorhanden.',
  loading = false,
  totalItems,
  page: controlledPage,
  onPageChange,
  sortKey: controlledSortKey,
  sortDir: controlledSortDir,
  onSortChange,
}: DataTableProps<T>) {
  const [localSortKey, setLocalSortKey] = useState<string | null>(null);
  const [localSortDir, setLocalSortDir] = useState<SortDir>('asc');
  const [localPage, setLocalPage] = useState(1);

  // Server-Modus: Sortierung/Pagination werden von außen gesteuert
  const serverSort = onSortChange !== undefined;
  const serverPage = onPageChange !== undefined;

  const sortKey = serverSort ? (controlledSortKey ?? null) : localSortKey;
  const sortDir = serverSort ? (controlledSortDir ?? 'asc') : localSortDir;
  const page = serverPage ? (controlledPage ?? 1) : localPage;

  function handleSort(key: string) {
    if (serverSort) {
      const dir: SortDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      onSortChange?.(key, dir);
      return;
    }
    if (localSortKey === key) {
      setLocalSortDir(localSortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setLocalSortKey(key);
      setLocalSortDir('asc');
    }
    setLocalPage(1);
  }

  function handlePageChange(next: number) {
    if (serverPage) {
      onPageChange?.(next);
    } else {
      setLocalPage(next);
    }
  }

  const sorted = useMemo(() => {
    if (serverSort || !localSortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[localSortKey];
      const bVal = (b as Record<string, unknown>)[localSortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), 'de', { sensitivity: 'base' });
      return localSortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, serverSort, localSortKey, localSortDir]);

  const total = serverPage ? (totalItems ?? data.length) : sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paged = serverPage ? sorted : sorted.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-10 rounded"
            style={{ background: 'var(--bg)', animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-3 py-2.5 font-semibold whitespace-nowrap"
                  style={{ color: 'var(--text)', width: col.width }}
                >
                  {col.sortable !== false ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
                    >
                      {col.label}
                      <SortIndicator active={sortKey === col.key} dir={sortKey === col.key ? sortDir : null} />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-8 text-center" style={{ color: 'var(--text-muted)' }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  onDoubleClick={() => onRowDoubleClick?.(row)}
                  className="transition-colors cursor-pointer"
                  style={{
                    background: row.id === selectedId ? 'var(--admin-selected)' : idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-3 py-2.5" style={{ color: 'var(--text-light)' }}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir | null }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.3 }}>
      {dir === 'desc' ? (
        <polyline points="18 15 12 9 6 15" />
      ) : (
        <polyline points="6 9 12 15 18 9" />
      )}
    </svg>
  );
}
