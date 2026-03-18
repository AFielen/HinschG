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
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  }

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), 'de', { sensitivity: 'base' });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

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
                    background: row.id === selectedId ? '#e8f0fe' : idx % 2 === 0 ? '#ffffff' : '#f9fafb',
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

      {sorted.length > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={sorted.length}
          pageSize={pageSize}
          onPageChange={setPage}
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
