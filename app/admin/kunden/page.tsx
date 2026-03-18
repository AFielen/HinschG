'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Demo Data ──────────────────────────────────────────────────────────────

interface KundeRow {
  id: number;
  kundenName: string;
  kundenGruppe: string;
  strasse: string;
  plz: string;
  ort: string;
  email: string;
}

const DEMO_DATA: KundeRow[] = [
  { id: 1, kundenName: 'DRK Kreisverband StädteRegion Aachen e.V.', kundenGruppe: 'Kreisverband', strasse: 'Henry-Dunant-Platz 1', plz: '52146', ort: 'Würselen', email: 'info@drk-aachen.de' },
  { id: 2, kundenName: 'DRK Ortsverein Aachen', kundenGruppe: 'Ortsverein', strasse: 'Musterstraße 10', plz: '52062', ort: 'Aachen', email: 'info@drk-ov-aachen.de' },
  { id: 3, kundenName: 'Musterfirma GmbH', kundenGruppe: 'Unternehmen', strasse: 'Industriestr. 5', plz: '52078', ort: 'Aachen', email: 'kontakt@musterfirma.de' },
];

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'kundenName', label: 'Kunden Name' },
  { key: 'kundenGruppe', label: 'Kunden Gruppe' },
  { key: 'strasse', label: 'Straße' },
  { key: 'plz', label: 'PLZ' },
  { key: 'ort', label: 'Ort' },
  { key: 'email', label: 'E-Mail' },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function KundenOverviewPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return DEMO_DATA;
    const term = searchTerm.toLowerCase();
    return DEMO_DATA.filter(
      (k) =>
        k.kundenName.toLowerCase().includes(term) ||
        k.kundenGruppe.toLowerCase().includes(term) ||
        k.ort.toLowerCase().includes(term) ||
        k.email.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: '#3d5a80' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Übersicht aller Kunden
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Sie können hier neue Kunden anlegen und bestehende Kunden bearbeiten.
            </p>
          </div>
        </div>
        <Link
          href="/admin/kunden/neu"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 shrink-0"
          style={{ background: '#3d5a80', minHeight: '44px' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Neuer Kunde
        </Link>
      </div>

      {/* Table Card */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 space-y-3">
          {/* Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <ButtonBar
              buttons={[
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Neu', icon: <PlusIcon />, href: '/admin/kunden/neu' },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => selectedId && router.push(`/admin/kunden/${selectedId}`), disabled: !selectedId },
                { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', disabled: !selectedId },
              ]}
            />
          </div>

          {/* Search */}
          {showSearch && (
            <div className="drk-fade-in">
              <input
                type="text"
                className="drk-input"
                placeholder="Suche nach Kundenname, Kundengruppe, Ort, E-Mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Table */}
          <DataTable
            columns={COLUMNS}
            data={filtered}
            pageSize={20}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => router.push(`/admin/kunden/${row.id}`)}
          />
        </div>
      </div>
    </div>
  );
}
