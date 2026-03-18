'use client';

interface StatusTabsProps {
  tabs: string[];
  active: string | null;
  onChange: (tab: string | null) => void;
  counts?: Record<string, number>;
}

export default function StatusTabs({ tabs, active, onChange, counts }: StatusTabsProps) {
  return (
    <div className="flex items-center gap-0 border-b" style={{ borderColor: 'var(--border)' }}>
      <TabButton
        label="Alle"
        isActive={active === null}
        onClick={() => onChange(null)}
        count={counts ? Object.values(counts).reduce((a, b) => a + b, 0) : undefined}
      />
      {tabs.map((tab) => (
        <TabButton
          key={tab}
          label={tab === 'InBearbeitung' ? 'In Bearbeitung' : tab}
          isActive={active === tab}
          onClick={() => onChange(tab)}
          count={counts?.[tab]}
        />
      ))}
    </div>
  );
}

function TabButton({
  label,
  isActive,
  onClick,
  count,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 text-sm font-medium transition-colors relative"
      style={{
        color: isActive ? '#3d5a80' : 'var(--text-muted)',
        borderBottom: isActive ? '2px solid #3d5a80' : '2px solid transparent',
        marginBottom: '-1px',
      }}
    >
      {label}
      {count !== undefined && (
        <span
          className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
          style={{
            background: isActive ? '#3d5a80' : 'var(--bg-secondary)',
            color: isActive ? '#fff' : 'var(--text-muted)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
