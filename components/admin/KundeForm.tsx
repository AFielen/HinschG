'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import CollapsibleSection from './CollapsibleSection';
import DataTable from './DataTable';
import ButtonBar, { PlusIcon, EditIcon, TrashIcon } from './ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

export interface KundeFormData {
  firma: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  telefax: string;
  firmenEmail: string;
  logoUrl: string;
  kundengruppeId: string; // '' = keine Gruppe, sonst id als String
  kundenKuerzel: string;
  aboModell: string;
  ansprechpartner: string;
  meldestelleEmail: string;
  meldestelleStrasse: string;
  meldestellePlz: string;
  meldestelleOrt: string;
  meldestelleInternetseite: string;
  meldestelleEmailPublic: string;
  meldestelleTelefonPublic: string;
  linkImpressum: string;
  linkDatenschutz: string;
}

export interface MitarbeiterRow {
  id: number;
  kundeId: number;
  anrede: 'Frau' | 'Herr' | null;
  vorname: string | null;
  nachname: string | null;
  email1: string | null;
  telefon: string | null;
  mobil: string | null;
  funktion: string | null;
  istMeldestelle: boolean;
  istGeschaeftsfuehrer: boolean;
}

interface Kundengruppe {
  id: number;
  name: string;
}

interface KundeFormProps {
  mode: 'create' | 'edit';
  kundeId?: number;
  initialData?: Partial<KundeFormData>;
  initialMitarbeiter?: MitarbeiterRow[];
}

interface MitarbeiterFormState {
  anrede: '' | 'Frau' | 'Herr';
  vorname: string;
  nachname: string;
  email1: string;
  telefon: string;
  mobil: string;
  funktion: string;
  istMeldestelle: boolean;
  istGeschaeftsfuehrer: boolean;
}

const EMPTY_MA_FORM: MitarbeiterFormState = {
  anrede: '',
  vorname: '',
  nachname: '',
  email1: '',
  telefon: '',
  mobil: '',
  funktion: '',
  istMeldestelle: false,
  istGeschaeftsfuehrer: false,
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    if (data && typeof data.error === 'string') return data.error;
  } catch {
    // Response ohne JSON-Body
  }
  return fallback;
}

// ── Mitarbeiter columns ────────────────────────────────────────────────────

const MITARBEITER_COLUMNS = [
  { key: 'anrede', label: 'Anrede', width: '80px' },
  { key: 'vorname', label: 'Vorname' },
  { key: 'nachname', label: 'Nachname' },
  { key: 'email1', label: 'E-Mail' },
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

export default function KundeForm({ mode, kundeId, initialData, initialMitarbeiter }: KundeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [kundengruppen, setKundengruppen] = useState<Kundengruppe[]>([]);

  const [form, setForm] = useState<KundeFormData>(() => ({
    firma: '',
    strasse: '',
    plz: '',
    ort: '',
    telefon: '',
    telefax: '',
    firmenEmail: '',
    logoUrl: '',
    kundengruppeId: '',
    kundenKuerzel: '',
    aboModell: '',
    ansprechpartner: '',
    meldestelleEmail: '',
    meldestelleStrasse: '',
    meldestellePlz: '',
    meldestelleOrt: '',
    meldestelleInternetseite: '',
    meldestelleEmailPublic: '',
    meldestelleTelefonPublic: '',
    linkImpressum: '',
    linkDatenschutz: '',
    ...initialData,
  }));

  // Mitarbeiter-Verwaltung (nur Edit-Modus)
  const [mitarbeiterListe, setMitarbeiterListe] = useState<MitarbeiterRow[]>(initialMitarbeiter ?? []);
  const [selectedMitarbeiterId, setSelectedMitarbeiterId] = useState<number | null>(null);
  const [maFormOffen, setMaFormOffen] = useState(false);
  const [maEditId, setMaEditId] = useState<number | null>(null);
  const [maForm, setMaForm] = useState<MitarbeiterFormState>(EMPTY_MA_FORM);
  const [maError, setMaError] = useState<string | null>(null);
  const [maSubmitting, setMaSubmitting] = useState(false);

  // Kundengruppen laden
  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/kundengruppen');
        if (!res.ok) return;
        const json = await res.json();
        if (aktiv && Array.isArray(json)) setKundengruppen(json);
      } catch {
        // Kundengruppen sind optional — Formular bleibt nutzbar
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  // Exit-Guard nur bei ungespeicherten Änderungen
  useEffect(() => {
    if (!dirty) return;
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [dirty]);

  function update(field: keyof KundeFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  // ── Kunde speichern ──────────────────────────────────────────────────────

  async function handleSave() {
    setFormError(null);

    if (!form.firma.trim() || !form.strasse.trim() || !form.plz.trim() || !form.ort.trim() || !form.telefon.trim()) {
      setFormError('Bitte füllen Sie die Pflichtfelder Kunden Name, Straße, PLZ, Ort und Telefon aus.');
      return;
    }
    if (!form.firmenEmail.trim() || !form.meldestelleEmail.trim()) {
      setFormError('Bitte geben Sie die Firmen-E-Mail und die E-Mail der Meldestelle an.');
      return;
    }

    const payload: Record<string, unknown> = {
      firma: form.firma.trim(),
      strasse: form.strasse.trim(),
      plz: form.plz.trim(),
      ort: form.ort.trim(),
      telefon: form.telefon.trim(),
      telefax: form.telefax.trim(),
      firmenEmail: form.firmenEmail.trim(),
      logoUrl: form.logoUrl.trim(),
      kundenKuerzel: form.kundenKuerzel.trim(),
      aboModell: form.aboModell.trim(),
      ansprechpartner: form.ansprechpartner.trim(),
      meldestelleEmail: form.meldestelleEmail.trim(),
      meldestelleStrasse: form.meldestelleStrasse.trim(),
      meldestellePlz: form.meldestellePlz.trim(),
      meldestelleOrt: form.meldestelleOrt.trim(),
      meldestelleInternetseite: form.meldestelleInternetseite.trim(),
      meldestelleEmailPublic: form.meldestelleEmailPublic.trim(),
      meldestelleTelefonPublic: form.meldestelleTelefonPublic.trim(),
      linkImpressum: form.linkImpressum.trim(),
      linkDatenschutz: form.linkDatenschutz.trim(),
    };
    if (form.kundengruppeId) {
      payload.kundengruppeId = Number(form.kundengruppeId);
    } else if (mode === 'edit') {
      payload.kundengruppeId = null;
    }

    setSaving(true);
    try {
      const endpoint = mode === 'create' ? '/api/admin/kunden' : `/api/admin/kunden/${kundeId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.status === 403) {
        setFormError('Nur für Administratoren.');
        return;
      }
      if (res.status === 400) {
        setFormError('Ungültige Eingabe — bitte prüfen Sie die Pflichtfelder und E-Mail-Adressen.');
        return;
      }
      if (!res.ok) {
        setFormError(await readErrorMessage(res, 'Der Kunde konnte nicht gespeichert werden.'));
        return;
      }
      setDirty(false);
      router.push('/admin/kunden');
    } catch {
      setFormError('Der Kunde konnte nicht gespeichert werden.');
    } finally {
      setSaving(false);
    }
  }

  // ── Mitarbeiter-Aktionen (Edit-Modus) ────────────────────────────────────

  const reloadMitarbeiter = useCallback(async () => {
    if (!kundeId) return;
    try {
      const res = await fetch(`/api/admin/mitarbeiter?kundeId=${kundeId}&limit=100`);
      if (!res.ok) return;
      const json = await res.json();
      if (Array.isArray(json.data)) setMitarbeiterListe(json.data);
    } catch {
      // Liste bleibt im alten Stand
    }
  }, [kundeId]);

  function openMaCreate() {
    setMaError(null);
    setMaEditId(null);
    setMaForm(EMPTY_MA_FORM);
    setMaFormOffen(true);
  }

  function openMaEdit() {
    const row = mitarbeiterListe.find((m) => m.id === selectedMitarbeiterId);
    if (!row) return;
    setMaError(null);
    setMaEditId(row.id);
    setMaForm({
      anrede: row.anrede ?? '',
      vorname: row.vorname ?? '',
      nachname: row.nachname ?? '',
      email1: row.email1 ?? '',
      telefon: row.telefon ?? '',
      mobil: row.mobil ?? '',
      funktion: row.funktion ?? '',
      istMeldestelle: row.istMeldestelle,
      istGeschaeftsfuehrer: row.istGeschaeftsfuehrer,
    });
    setMaFormOffen(true);
  }

  async function handleMaSubmit(e: FormEvent) {
    e.preventDefault();
    if (!kundeId) return;
    setMaError(null);
    setMaSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        vorname: maForm.vorname.trim(),
        nachname: maForm.nachname.trim(),
        email1: maForm.email1.trim(),
        telefon: maForm.telefon.trim(),
        mobil: maForm.mobil.trim(),
        funktion: maForm.funktion.trim(),
        istMeldestelle: maForm.istMeldestelle,
        istGeschaeftsfuehrer: maForm.istGeschaeftsfuehrer,
      };
      if (maForm.anrede) body.anrede = maForm.anrede;

      const isEdit = maEditId !== null;
      const endpoint = isEdit ? `/api/admin/mitarbeiter/${maEditId}` : '/api/admin/mitarbeiter';
      if (!isEdit) body.kundeId = kundeId;

      const res = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 403) {
        setMaError('Nur für Administratoren.');
        return;
      }
      if (!res.ok) {
        setMaError(await readErrorMessage(res, 'Der Mitarbeiter konnte nicht gespeichert werden.'));
        return;
      }
      setMaFormOffen(false);
      setMaEditId(null);
      setMaForm(EMPTY_MA_FORM);
      await reloadMitarbeiter();
    } catch {
      setMaError('Der Mitarbeiter konnte nicht gespeichert werden.');
    } finally {
      setMaSubmitting(false);
    }
  }

  async function handleMaDelete() {
    const row = mitarbeiterListe.find((m) => m.id === selectedMitarbeiterId);
    if (!row) return;
    const name = [row.vorname, row.nachname].filter(Boolean).join(' ') || `#${row.id}`;
    if (!window.confirm(`Mitarbeiter „${name}“ wirklich entfernen?`)) return;

    setMaError(null);
    try {
      const res = await fetch(`/api/admin/mitarbeiter/${row.id}`, { method: 'DELETE' });
      if (res.status === 403) {
        setMaError('Nur für Administratoren.');
        return;
      }
      if (!res.ok) {
        setMaError(await readErrorMessage(res, 'Der Mitarbeiter konnte nicht entfernt werden.'));
        return;
      }
      setSelectedMitarbeiterId(null);
      await reloadMitarbeiter();
    } catch {
      setMaError('Der Mitarbeiter konnte nicht entfernt werden.');
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: 'var(--admin-accent)' }}>
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
            style={{ background: 'var(--admin-accent)', color: '#fff', minHeight: '44px' }}
          >
            {saving ? 'Speichert...' : 'Kunde speichern'}
          </button>
        </div>
      </div>

      {/* Fehler */}
      {formError && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
        >
          {formError}
        </div>
      )}

      {/* Section 1: Allgemeine Daten */}
      <CollapsibleSection title="Allgemeine Daten">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="drk-label">Kunden Name *</label>
            <input type="text" className="drk-input" value={form.firma} onChange={(e) => update('firma', e.target.value)} placeholder="Name der Organisation..." />
          </div>
          <div>
            <label className="drk-label">Straße und Hausnummer *</label>
            <input type="text" className="drk-input" value={form.strasse} onChange={(e) => update('strasse', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">PLZ *</label>
            <input type="text" className="drk-input" value={form.plz} onChange={(e) => update('plz', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Ort *</label>
            <input type="text" className="drk-input" value={form.ort} onChange={(e) => update('ort', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Telefon *</label>
            <input type="tel" className="drk-input" value={form.telefon} onChange={(e) => update('telefon', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Telefax</label>
            <input type="tel" className="drk-input" value={form.telefax} onChange={(e) => update('telefax', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Firmen-E-Mail *</label>
            <input type="email" className="drk-input" value={form.firmenEmail} onChange={(e) => update('firmenEmail', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Ansprechpartner</label>
            <input type="text" className="drk-input" value={form.ansprechpartner} onChange={(e) => update('ansprechpartner', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Kunden-Kürzel</label>
            <input type="text" className="drk-input" value={form.kundenKuerzel} onChange={(e) => update('kundenKuerzel', e.target.value)} placeholder="z.B. DRK-AC" />
          </div>
          <div>
            <label className="drk-label">Abo-Modell</label>
            <input type="text" className="drk-input" value={form.aboModell} onChange={(e) => update('aboModell', e.target.value)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 2: Kunden Logo */}
      <CollapsibleSection title="Kunden Logo" defaultOpen={false}>
        <div className="space-y-2">
          <label className="drk-label">Logo-URL</label>
          <input
            type="url"
            className="drk-input"
            value={form.logoUrl}
            onChange={(e) => update('logoUrl', e.target.value)}
            placeholder="https://..."
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            URL zu einem extern gehosteten Logo (PNG oder SVG). Das Logo wird in der Meldestelle angezeigt.
          </p>
        </div>
      </CollapsibleSection>

      {/* Section 3: Kundengruppe */}
      <CollapsibleSection title="Kundengruppe">
        <div>
          <label className="drk-label">Kundengruppe</label>
          <select className="drk-input" value={form.kundengruppeId} onChange={(e) => update('kundengruppeId', e.target.value)}>
            <option value="">Keine Gruppe</option>
            {form.kundengruppeId && !kundengruppen.some((g) => String(g.id) === form.kundengruppeId) && (
              <option value={form.kundengruppeId}>Gruppe #{form.kundengruppeId}</option>
            )}
            {kundengruppen.map((g) => (
              <option key={g.id} value={String(g.id)}>{g.name}</option>
            ))}
          </select>
        </div>
      </CollapsibleSection>

      {/* Section 4: Interne Meldestelle */}
      <CollapsibleSection title="Interne Meldestelle">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="drk-label">E-Mail der Meldestelle (intern) *</label>
            <input type="email" className="drk-input" value={form.meldestelleEmail} onChange={(e) => update('meldestelleEmail', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Straße und Hausnummer</label>
            <input type="text" className="drk-input" value={form.meldestelleStrasse} onChange={(e) => update('meldestelleStrasse', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">PLZ</label>
            <input type="text" className="drk-input" value={form.meldestellePlz} onChange={(e) => update('meldestellePlz', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Ort</label>
            <input type="text" className="drk-input" value={form.meldestelleOrt} onChange={(e) => update('meldestelleOrt', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Internetseite</label>
            <input type="url" className="drk-input" value={form.meldestelleInternetseite} onChange={(e) => update('meldestelleInternetseite', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="drk-label">Öffentliche E-Mail</label>
            <input type="email" className="drk-input" value={form.meldestelleEmailPublic} onChange={(e) => update('meldestelleEmailPublic', e.target.value)} />
          </div>
          <div>
            <label className="drk-label">Öffentliches Telefon</label>
            <input type="tel" className="drk-input" value={form.meldestelleTelefonPublic} onChange={(e) => update('meldestelleTelefonPublic', e.target.value)} />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 5: Rechtliche Links */}
      <CollapsibleSection title="Rechtliche Links" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="drk-label">Link Impressum</label>
            <input type="url" className="drk-input" value={form.linkImpressum} onChange={(e) => update('linkImpressum', e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="drk-label">Link Datenschutz</label>
            <input type="url" className="drk-input" value={form.linkDatenschutz} onChange={(e) => update('linkDatenschutz', e.target.value)} placeholder="https://..." />
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 6: Mitarbeiter */}
      {mode === 'edit' && kundeId !== undefined && (
        <CollapsibleSection title="Mitarbeiter">
          <div className="space-y-3">
            <ButtonBar
              buttons={[
                { label: 'Hinzufügen', icon: <PlusIcon />, onClick: openMaCreate },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: openMaEdit, disabled: !selectedMitarbeiterId },
                { label: 'Entfernen', icon: <TrashIcon />, variant: 'danger', onClick: handleMaDelete, disabled: !selectedMitarbeiterId },
              ]}
            />

            {maError && !maFormOffen && (
              <p className="text-sm" style={{ color: 'var(--drk)' }}>{maError}</p>
            )}

            {maFormOffen && (
              <form
                onSubmit={handleMaSubmit}
                className="rounded-lg p-4 space-y-3"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  {maEditId !== null ? 'Mitarbeiter bearbeiten' : 'Mitarbeiter hinzufügen'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="drk-label">Anrede</label>
                    <select
                      className="drk-input"
                      value={maForm.anrede}
                      onChange={(e) => setMaForm((p) => ({ ...p, anrede: e.target.value as '' | 'Frau' | 'Herr' }))}
                    >
                      <option value="">Keine Angabe</option>
                      <option value="Frau">Frau</option>
                      <option value="Herr">Herr</option>
                    </select>
                  </div>
                  <div>
                    <label className="drk-label">Funktion</label>
                    <input type="text" className="drk-input" value={maForm.funktion} onChange={(e) => setMaForm((p) => ({ ...p, funktion: e.target.value }))} placeholder="z.B. Compliance" />
                  </div>
                  <div>
                    <label className="drk-label">Vorname</label>
                    <input type="text" className="drk-input" value={maForm.vorname} onChange={(e) => setMaForm((p) => ({ ...p, vorname: e.target.value }))} />
                  </div>
                  <div>
                    <label className="drk-label">Nachname</label>
                    <input type="text" className="drk-input" value={maForm.nachname} onChange={(e) => setMaForm((p) => ({ ...p, nachname: e.target.value }))} />
                  </div>
                  <div>
                    <label className="drk-label">E-Mail</label>
                    <input type="email" className="drk-input" value={maForm.email1} onChange={(e) => setMaForm((p) => ({ ...p, email1: e.target.value }))} />
                  </div>
                  <div>
                    <label className="drk-label">Telefon</label>
                    <input type="tel" className="drk-input" value={maForm.telefon} onChange={(e) => setMaForm((p) => ({ ...p, telefon: e.target.value }))} />
                  </div>
                  <div>
                    <label className="drk-label">Mobil</label>
                    <input type="tel" className="drk-input" value={maForm.mobil} onChange={(e) => setMaForm((p) => ({ ...p, mobil: e.target.value }))} />
                  </div>
                  <div className="flex items-end gap-5 pb-1.5">
                    <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                      <input
                        type="checkbox"
                        checked={maForm.istMeldestelle}
                        onChange={(e) => setMaForm((p) => ({ ...p, istMeldestelle: e.target.checked }))}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--admin-accent)' }}
                      />
                      Meldestelle
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                      <input
                        type="checkbox"
                        checked={maForm.istGeschaeftsfuehrer}
                        onChange={(e) => setMaForm((p) => ({ ...p, istGeschaeftsfuehrer: e.target.checked }))}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: 'var(--admin-accent)' }}
                      />
                      Geschäftsführer
                    </label>
                  </div>
                </div>
                {maError && (
                  <p className="text-sm" style={{ color: 'var(--drk)' }}>{maError}</p>
                )}
                <div className="flex items-center gap-2">
                  <button type="submit" className="drk-btn-primary" disabled={maSubmitting}>
                    {maSubmitting ? 'Wird gespeichert…' : maEditId !== null ? 'Änderungen speichern' : 'Mitarbeiter anlegen'}
                  </button>
                  <button
                    type="button"
                    className="drk-btn-secondary"
                    onClick={() => {
                      setMaFormOffen(false);
                      setMaEditId(null);
                      setMaError(null);
                    }}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            )}

            <DataTable
              columns={MITARBEITER_COLUMNS}
              data={mitarbeiterListe}
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
