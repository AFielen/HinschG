type Variant = 'neu' | 'bearbeitung' | 'abgeschlossen' | 'offen';

const STYLES: Record<Variant, { bg: string; color: string }> = {
  neu: { bg: 'var(--info-bg)', color: 'var(--info-text)' },
  bearbeitung: { bg: 'var(--warning-bg)', color: 'var(--warning-text)' },
  abgeschlossen: { bg: 'var(--success-bg)', color: 'var(--success-text)' },
  offen: { bg: 'var(--info-bg)', color: 'var(--info-text)' },
};

interface StatusBadgeProps {
  status: string;
}

function resolveVariant(status: string): Variant {
  const lower = status.toLowerCase();
  if (lower === 'neu' || lower === 'offen') return 'neu';
  if (lower === 'inbearbeitung' || lower.includes('bearbeitung')) return 'bearbeitung';
  if (lower === 'abgeschlossen') return 'abgeschlossen';
  return 'offen';
}

const DISPLAY: Record<string, string> = {
  Neu: 'Neu',
  InBearbeitung: 'In Bearbeitung',
  Abgeschlossen: 'Abgeschlossen',
  Offen: 'Offen',
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const variant = resolveVariant(status);
  const s = STYLES[variant];
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ background: s.bg, color: s.color }}
    >
      {DISPLAY[status] ?? status}
    </span>
  );
}
