type Variant = 'neu' | 'bearbeitung' | 'abgeschlossen' | 'offen';

const STYLES: Record<Variant, { bg: string; color: string }> = {
  neu: { bg: '#dbeafe', color: '#1e40af' },
  bearbeitung: { bg: '#fef3c7', color: '#92400e' },
  abgeschlossen: { bg: '#d1fae5', color: '#065f46' },
  offen: { bg: '#dbeafe', color: '#1e40af' },
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
