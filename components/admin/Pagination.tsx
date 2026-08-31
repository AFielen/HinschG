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
        <PagBtn onClick={() => onPageChange(1)} disabled={page <= 1} label="Erste Seite">
          <ChevronsLeftIcon />
        </PagBtn>
        <PagBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} label="Vorherige Seite">
          <ChevronLeftIcon />
        </PagBtn>
        <span className="px-3 py-1 text-sm font-medium" style={{ color: 'var(--text)' }}>
          {page} / {totalPages || 1}
        </span>
        <PagBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} label="Nächste Seite">
          <ChevronRightIcon />
        </PagBtn>
        <PagBtn onClick={() => onPageChange(totalPages)} disabled={page >= totalPages} label="Letzte Seite">
          <ChevronsRightIcon />
        </PagBtn>
      </div>
    </div>
  );
}

function PagBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="flex items-center justify-center w-8 h-8 rounded transition-colors disabled:opacity-30"
      style={{ color: 'var(--text-light)' }}
    >
      {children}
    </button>
  );
}

// ── Icons (Lucide-Stil) ────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function ChevronsLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </svg>
  );
}

function ChevronsRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </svg>
  );
}
