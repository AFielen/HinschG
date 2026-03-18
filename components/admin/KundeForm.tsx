'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CollapsibleSection from './CollapsibleSection';
import DataTable from './DataTable';
import ButtonBar, { PlusIcon, EditIcon, TrashIcon } from './ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface KundeFormData {
  kundenName: string;
  kundenGruppe: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  webseite: string;
  ansprechpartner: string;
  vertragsBeginn: string;
  vertragsEnde: string;
  vertragsNotizen: string;
  meldestelleName: string;
  meldestelleEmail: string;
  meldestelleTelefon: string;
  meldestelleUrl: string;
}

interface KundeFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<KundeFormData>;
  kundeId?: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const KUNDENGRUPPEN = [
  'Kreisverband',
  'Ortsverein',
  'Landesverband',
  'Unternehmen',
  'Behörde',
  'Sonstige',
];

// ── Mitarbeiter Demo Data ──────────────────────────────────────────────────

interface MitarbeiterRow {
  id: number;
  anrede: string;
  vorname: string;
  nachname: string;
  email: string;
  telefon: string;
  funktion: string;
  istGeschaeftsfuehrer: boolean;
  istMeldestelle: boolean;
}

const MITARBEITER_DEMO: MitarbeiterRow[] = [
  { id: 1, anrede: 'Herr', vorname: 'Max', nachname: 'Mustermann', email: 'max@drk-aachen.de', telefon: '+49 241 12345', funktion: 'Geschäftsführer', istGeschaeftsfuehrer: true, istMeldestelle: false },
  { id: 2, anrede: 'Frau', vorname: 'Erika', nachname: 'Musterfrau', email: 'erika@drk-aachen.de', telefon: '+49 241 12346', funktion: 'Compliance', istGeschaeftsfuehrer: false, istMeldestelle: true },
];

const MITARBEITER_COLUMNS = [
  { key: 'anrede', label: 'Anrede', width: '80px' },
  { key: 'vorname', label: 'Vorname' },
  { key: 'nachname', label: 'Nachname' },
  { key: 'email', label: 'E-Mail' },
  { key: 'telefon', label: 'Telefon' },
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

// ── Component ──────────────────────────────────────────────────────────────

export default function KundeForm({ mode, initialData, kundeId }: KundeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<number | null>(null);

  const [form, setForm] = useState<KundeFormData>(() => ({
    kundenName: '',
    kundenGruppe: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    ort: '',
    telefon: '',
    email: '',
    webseite: '',
    ansprechpartner: '',
    vertragsBeginn: '',
    vertragsEnde: '',
    vertragsNotizen: '',
    meldestelleName: '',
    meldestelleEmail: '',
    meldestelleTelefon: '',
    meldestelleUrl: '',
    ...initialData,
  }));

  // Exit guard for unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  function update(field: keyof KundeFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const endpoint = mode === 'create' ? '/api/admin/kunden' : `/api/admin/kunden/${kundeId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push('/admin/kunden');
      }
    } finally {
      setSaving(false);
    }
  }

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
              {mode === 'create' ? 'Kunde anlegen' : 'Kunde bearbeiten'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Sie können hier Kunden anlegen oder bearbeiten.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/admin/kunden')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: '#dc2626', color: '#fff', minHeight: '44px' }}
          >
            Änderung verwerfen
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#3d5a80', color: '#fff', minHeight: '44px' }}
          >
            {saving ? 'Speichert...' : 'Kunde speichern'}
          </button>
        </div>
      </div>

      {/* Section 1: Allgemeine Daten */}
      <CollapsibleSection title="Allgemeine Daten">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="drk-label">Kunden Name *</label>
            <input type="text" className="drk-input" value={form.kundenName} onChange={(e) => update('kundenName', e.target.value)} placeholder="Name der Organisation..." />
          </div>
          <div>
            <label className="drk-label">Straße</label>
            <input type="text" className="drk-input" value={form.strasse} onChange={(e) => update('strasse', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Hausnummer</label>
            <input type="text" className="drk-input" value={form.hausnummer} onChange={(e) => update('hausnummer', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">PLZ</label>
            <input type="text" className="drk-input" value={form.plz} onChange={(e) => update('plz', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Ort</label>
            <input type="text" className="drk-input" value={form.ort} onChange={(e) => update('ort', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Telefon</label>
            <input type="tel" className="drk-input" value={form.telefon} onChange={(e) => update('telefon', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">E-Mail</label>
            <input type="email" className="drk-input" value={form.email} onChange={(e) => update('email', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Webseite</label>
            <input type="url" className="drk-input" value={form.webseite} onChange={(e) => update('webseite', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="drk-label">Ansprechpartner</label>
            <input type="text" className="drk-input" value={form.ansprechpartner} onChange={(e) => update('ansprechpartner', e.target.value)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Kunden Logo */}
      <CollapsibleSection title="Kunden Logo" defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <label className="drk-label">Logo hochladen</label>
            <input type="file" accept="image/*" className="drk-input text-sm" style={{ padding: '0.5rem 1rem' }} />
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Empfohlenes Format: PNG oder SVG, max. 2 MB. Das Logo wird in der Meldestelle angezeigt.
          </p>
        </div>
      </CollapsibleSection>

      {/* Section 3: Kundengruppe */}
      <CollapsibleSection title="Kundengruppe">
        <div>
          <label className="drk-label">Kundengruppe</label>
          <select className="drk-input" value={form.kundenGruppe} onChange={(e) => update('kundenGruppe', e.target.value)}>
            <option value="">Bitte wählen...</option>
            {KUNDENGRUPPEN.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </CollapsibleSection>

      {/* Section 4: Vertrag */}
      <CollapsibleSection title="Vertrag" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="drk-label">Vertragsbeginn</label>
            <input type="date" className="drk-input" value={form.vertragsBeginn} onChange={(e) => update('vertragsBeginn', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Vertragsende</label>
            <input type="date" className="drk-input" value={form.vertragsEnde} onChange={(e) => update('vertragsEnde', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="drk-label">Notizen zum Vertrag</label>
            <textarea className="drk-input" rows={3} value={form.vertragsNotizen} onChange={(e) => update('vertragsNotizen', e.target.value)} placeholder="Interne Notizen zum Vertrag..." />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 5: Interne Meldestelle */}
      <CollapsibleSection title="Interne Meldestelle">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="drk-label">Name der Meldestelle</label>
            <input type="text" className="drk-input" value={form.meldestelleName} onChange={(e) => update('meldestelleName', e.target.value)} placeholder="z.B. Compliance-Abteilung" />
          </div>
          <div>
            <label className="drk-label">E-Mail der Meldestelle</label>
            <input type="email" className="drk-input" value={form.meldestelleEmail} onChange={(e) => update('meldestelleEmail', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Telefon der Meldestelle</label>
            <input type="tel" className="drk-input" value={form.meldestelleTelefon} onChange={(e) => update('meldestelleTelefon', e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="drk-label">URL der Meldestelle</label>
            <input type="url" className="drk-input" value={form.meldestelleUrl} onChange={(e) => update('meldestelleUrl', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 6: Mitarbeiter */}
      {mode === 'edit' && (
        <CollapsibleSection title="Mitarbeiter">
          <div className="space-y-3">
            <ButtonBar
              buttons={[
                { label: 'Hinzufügen', icon: <PlusIcon />, onClick: () => {} },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => {}, disabled: !selectedMitarbeiterId },
                { label: 'Entfernen', icon: <TrashIcon />, variant: 'danger', disabled: !selectedMitarbeiterId },
              ]}
            />
            <DataTable
              columns={MITARBEITER_COLUMNS}
              data={MITARBEITER_DEMO}
              pageSize={10}
              selectedId={selectedMitarbeiterId}
              onRowClick={(row) => setSelectedMitarbeiterId(row.id)}
              emptyMessage="Keine Mitarbeiter zugeordnet."
            />
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
