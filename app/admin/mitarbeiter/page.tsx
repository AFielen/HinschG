'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Demo Data ──────────────────────────────────────────────────────────────

interface MitarbeiterRow {
  id: number;
  firma: string;
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  mobil: string;
  funktion: string;
  istMeldestelle: boolean;
  istGeschaeftsfuehrer: boolean;
}

const DEMO_DATA: MitarbeiterRow[] = [
  { id: 1, firma: 'DRK Kreisverband Aachen e.V.', anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', email: 'max@drk-aachen.de', telefon: '+49 241 12345', mobil: '+49 170 1234567', funktion: 'Geschäftsführer', istMeldestelle: false, istGeschaeftsfuehrer: true },
  { id: 2, firma: 'DRK Kreisverband Aachen e.V.', anrede: 'Frau', vorname: 'Erika', nachname: 'Musterfrau', email: 'erika@drk-aachen.de', telefon: '+49 241 12346', mobil: '+49 170 7654321', funktion: 'Compliance', istMeldestelle: true, istGeschaeftsfuehrer: false },
  { id: 3, firma: 'Musterfirma GmbH', anrede: 'Herr', vorname: 'Thomas', nachname: 'Schmidt', email: 'schmidt@musterfirma.de', telefon: '+49 241 98765', mobil: '', funktion: 'Datenschutzbeauftragter', istMeldestelle: true, istGeschaeftsfuehrer: false },
];

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'firma', label: 'Firma' },
  { key: 'anrede', label: 'Anrede', width: '80px' },
  { key: 'vorname', label: 'Vorname' },
  { key: 'nachname', label: 'Nachname' },
  { key: 'email', label: 'E-Mail' },
  { key: 'telefon', label: 'Telefon' },
  { key: 'mobil', label: 'Mobil' },
  { key: 'funktion', label: 'Funktion' },
  {
    key: 'istMeldestelle',
    label: 'Meldestelle',
    render: (row: MitarbeiterRow) => (
      <span style={{ color: row.istMeldestelle ? 'var(--success)' : 'var(--text-muted)' }}>
        {row.istMeldestelle ? 'Ja' : 'Nein'}
      </span>
    ),
  },
  {
    key: 'istGeschaeftsfuehrer',
    label: 'GF',
    width: '60px',
    render: (row: MitarbeiterRow) => (
      <span style={{ color: row.istGeschaeftsfuehrer ? 'var(--success)' : 'var(--text-muted)' }}>
        {row.istGeschaeftsfuehrer ? 'Ja' : 'Nein'}
      </span>
    ),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function MitarbeiterOverviewPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return DEMO_DATA;
    const term = searchTerm.toLowerCase();
    return DEMO_DATA.filter(
      (m) =>
        m.firma.toLowerCase().includes(term) ||
        m.vorname.toLowerCase().includes(term) ||
        m.nachname.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term) ||
        m.funktion.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: '#3d5a80' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Übersicht aller Mitarbeiter
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Alle Mitarbeiter der zugeordneten Kunden im Überblick.
            </p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', boxShadow: 'var(--shadow)' }}>
        <div className="p-4 space-y-3">
          {/* Button Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <ButtonBar
              buttons={[
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Neu', icon: <PlusIcon />, onClick: () => {} },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => {}, disabled: !selectedId },
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
                placeholder="Suche nach Firma, Name, E-Mail, Funktion..."
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
          />
        </div>
      </div>
    </div>
  );
}
