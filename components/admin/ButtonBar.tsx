'use client';

interface ButtonDef {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'danger';
  disabled?: boolean;
}

interface ButtonBarProps {
  buttons: ButtonDef[];
}

export default function ButtonBar({ buttons }: ButtonBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {buttons.map((btn) => {
        const isDanger = btn.variant === 'danger';
        const style: React.CSSProperties = isDanger
          ? { background: '#dc2626', color: '#fff' }
          : { background: '#3d5a80', color: '#fff' };

        const className = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed';

        if (btn.href) {
          return (
            <a key={btn.label} href={btn.href} className={className} style={style}>
              {btn.icon}
              {btn.label}
            </a>
          );
        }

        return (
          <button
            key={btn.label}
            type="button"
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={className}
            style={style}
          >
            {btn.icon}
            {btn.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Common Icons ───────────────────────────────────────────────────────────

export function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
