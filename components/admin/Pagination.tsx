'use client';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-3 text-sm" style={{ color: 'var(--text-light)' }}>
      <span>
        {start} bis {end} von {totalItems}
      </span>
      <div className="flex items-center gap-1">
        <PagBtn onClick={() => onPageChange(1)} disabled={page <= 1} label="|◄" />
        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} label="◄" />
        <span className="px-3 py-1 text-sm font-medium" style={{ color: 'var(--text)' }}>
          {page} / {totalPages || 1}
        </span>
        <PagBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} label="►" />
        <PagBtn onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} label="►|" />
      </div>
    </div>
  );
}

function PagBtn({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="px-2 py-1 rounded text-sm font-mono transition-colors disabled:opacity-30"
      style={{ color: 'var(--text-light)' }}
    >
      {label}
    </button>
  );
}
