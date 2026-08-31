'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import DataTable from '@/components/admin/DataTable';
import ButtonBar, { SearchIcon, PlusIcon, EditIcon, TrashIcon } from '@/components/admin/ButtonBar';

// ── Types ──────────────────────────────────────────────────────────────────

interface MitarbeiterRow {
  id: number;
  kundeId: number;
  firma: string | null;
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

interface KundeOption {
  id: number;
  firma: string;
}

interface MitarbeiterFormState {
  kundeId: string;
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

const EMPTY_FORM: MitarbeiterFormState = {
  kundeId: '',
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

const PAGE_SIZE = 20;

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

// ── Columns ────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'firma', label: 'Firma', sortable: false },
  { key: 'anrede', label: 'Anrede', width: '80px', sortable: false },
  { key: 'vorname', label: 'Vorname', sortable: false },
  { key: 'nachname', label: 'Nachname', sortable: false },
  { key: 'email1', label: 'E-Mail', sortable: false },
  { key: 'telefon', label: 'Telefon', sortable: false },
  { key: 'mobil', label: 'Mobil', sortable: false },
  { key: 'funktion', label: 'Funktion', sortable: false },
  {
    key: 'istMeldestelle',
    label: 'Meldestelle',
    sortable: false,
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
    sortable: false,
    render: (row: MitarbeiterRow) => (
      <span style={{ color: row.istGeschaeftsfuehrer ? 'var(--success)' : 'var(--text-muted)' }}>
        {row.istGeschaeftsfuehrer ? 'Ja' : 'Nein'}
      </span>
    ),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────

export default function MitarbeiterOverviewPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suche, setSuche] = useState(''); // debounced
  const [showSearch, setShowSearch] = useState(false);
  const [kundeFilter, setKundeFilter] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<MitarbeiterRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const [kunden, setKunden] = useState<KundeOption[]>([]);

  // Inline-Formular (Neu/Bearbeiten)
  const [formOffen, setFormOffen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<MitarbeiterFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Suchbegriff entprellen
  useEffect(() => {
    const t = setTimeout(() => {
      setSuche(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Kundenliste für Filter und Formular laden
  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/kunden?limit=100&sort=firma&order=asc');
        if (!res.ok) return;
        const json = await res.json();
        if (aktiv && Array.isArray(json.data)) {
          setKunden(json.data.map((k: { id: number; firma: string }) => ({ id: k.id, firma: k.firma })));
        }
      } catch {
        // Filter bleibt leer — Seite bleibt nutzbar
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setFehler(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (suche) params.set('search', suche);
      if (kundeFilter) params.set('kundeId', kundeFilter);

      const res = await fetch(`/api/admin/mitarbeiter?${params.toString()}`);
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Mitarbeiter konnten nicht geladen werden.'));
        return;
      }
      const json = await res.json();
      setRows(Array.isArray(json.data) ? json.data : []);
      setTotal(typeof json.total === 'number' ? json.total : 0);
    } catch {
      setFehler('Mitarbeiter konnten nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [page, suche, kundeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Aktionen ─────────────────────────────────────────────────────────────

  function openCreate() {
    setFormError(null);
    setEditId(null);
    setForm({ ...EMPTY_FORM, kundeId: kundeFilter });
    setFormOffen(true);
  }

  function openEdit(row: MitarbeiterRow | undefined) {
    if (!row) return;
    setFormError(null);
    setEditId(row.id);
    setForm({
      kundeId: String(row.kundeId),
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
    setFormOffen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.kundeId) {
      setFormError('Bitte wählen Sie einen Kunden aus.');
      return;
    }

    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        kundeId: Number(form.kundeId),
        vorname: form.vorname.trim(),
        nachname: form.nachname.trim(),
        email1: form.email1.trim(),
        telefon: form.telefon.trim(),
        mobil: form.mobil.trim(),
        funktion: form.funktion.trim(),
        istMeldestelle: form.istMeldestelle,
        istGeschaeftsfuehrer: form.istGeschaeftsfuehrer,
      };
      if (form.anrede) body.anrede = form.anrede;

      const isEdit = editId !== null;
      const res = await fetch(isEdit ? `/api/admin/mitarbeiter/${editId}` : '/api/admin/mitarbeiter', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 403) {
        setFormError('Nur für Administratoren.');
        return;
      }
      if (!res.ok) {
        setFormError(await readErrorMessage(res, 'Der Mitarbeiter konnte nicht gespeichert werden.'));
        return;
      }
      setFormOffen(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchData();
    } catch {
      setFormError('Der Mitarbeiter konnte nicht gespeichert werden.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const row = rows.find((r) => r.id === selectedId);
    if (!row) return;
    const name = [row.vorname, row.nachname].filter(Boolean).join(' ') || `#${row.id}`;
    if (!window.confirm(`Mitarbeiter „${name}“ wirklich löschen?`)) return;

    setFehler(null);
    try {
      const res = await fetch(`/api/admin/mitarbeiter/${row.id}`, { method: 'DELETE' });
      if (res.status === 403) {
        setFehler('Nur für Administratoren.');
        return;
      }
      if (!res.ok) {
        setFehler(await readErrorMessage(res, 'Der Mitarbeiter konnte nicht gelöscht werden.'));
        return;
      }
      setSelectedId(null);
      fetchData();
    } catch {
      setFehler('Der Mitarbeiter konnte nicht gelöscht werden.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: 'var(--admin-accent)' }}>
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
          {/* Button Bar + Kundenfilter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <ButtonBar
              buttons={[
                { label: 'Suchen', icon: <SearchIcon />, onClick: () => setShowSearch(!showSearch) },
                { label: 'Neu', icon: <PlusIcon />, onClick: openCreate },
                { label: 'Bearbeiten', icon: <EditIcon />, onClick: () => openEdit(rows.find((r) => r.id === selectedId)), disabled: !selectedId },
                { label: 'Löschen', icon: <TrashIcon />, variant: 'danger', onClick: handleDelete, disabled: !selectedId },
              ]}
            />
            <select
              className="drk-input text-sm sm:max-w-xs"
              value={kundeFilter}
              onChange={(e) => {
                setKundeFilter(e.target.value);
                setSelectedId(null);
                setPage(1);
              }}
              aria-label="Nach Kunde filtern"
            >
              <option value="">Alle Kunden</option>
              {kunden.map((k) => (
                <option key={k.id} value={String(k.id)}>{k.firma}</option>
              ))}
            </select>
          </div>

          {/* Fehler */}
          {fehler && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
            >
              {fehler}
            </div>
          )}

          {/* Search */}
          {showSearch && (
            <div className="drk-fade-in">
              <input
                type="text"
                className="drk-input"
                placeholder="Suche nach Name, E-Mail, Funktion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* Inline-Formular */}
          {formOffen && (
            <form
              onSubmit={handleSubmit}
              className="rounded-lg p-4 space-y-3"
              style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
            >
              <h2 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                {editId !== null ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter anlegen'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="drk-label">Kunde *</label>
                  <select
                    className="drk-input"
                    value={form.kundeId}
                    onChange={(e) => setForm((p) => ({ ...p, kundeId: e.target.value }))}
                    required
                  >
                    <option value="">Bitte wählen...</option>
                    {kunden.map((k) => (
                      <option key={k.id} value={String(k.id)}>{k.firma}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="drk-label">Anrede</label>
                  <select
                    className="drk-input"
                    value={form.anrede}
                    onChange={(e) => setForm((p) => ({ ...p, anrede: e.target.value as '' | 'Frau' | 'Herr' }))}
                  >
                    <option value="">Keine Angabe</option>
                    <option value="Frau">Frau</option>
                    <option value="Herr">Herr</option>
                  </select>
                </div>
                <div>
                  <label className="drk-label">Vorname</label>
                  <input type="text" className="drk-input" value={form.vorname} onChange={(e) => setForm((p) => ({ ...p, vorname: e.target.value }))} />
                </div>
                <div>
                  <label className="drk-label">Nachname</label>
                  <input type="text" className="drk-input" value={form.nachname} onChange={(e) => setForm((p) => ({ ...p, nachname: e.target.value }))} />
                </div>
                <div>
                  <label className="drk-label">E-Mail</label>
                  <input type="email" className="drk-input" value={form.email1} onChange={(e) => setForm((p) => ({ ...p, email1: e.target.value }))} />
                </div>
                <div>
                  <label className="drk-label">Funktion</label>
                  <input type="text" className="drk-input" value={form.funktion} onChange={(e) => setForm((p) => ({ ...p, funktion: e.target.value }))} placeholder="z.B. Compliance" />
                </div>
                <div>
                  <label className="drk-label">Telefon</label>
                  <input type="tel" className="drk-input" value={form.telefon} onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))} />
                </div>
                <div>
                  <label className="drk-label">Mobil</label>
                  <input type="tel" className="drk-input" value={form.mobil} onChange={(e) => setForm((p) => ({ ...p, mobil: e.target.value }))} />
                </div>
                <div className="flex items-center gap-5 sm:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    <input
                      type="checkbox"
                      checked={form.istMeldestelle}
                      onChange={(e) => setForm((p) => ({ ...p, istMeldestelle: e.target.checked }))}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--admin-accent)' }}
                    />
                    Meldestelle
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text)' }}>
                    <input
                      type="checkbox"
                      checked={form.istGeschaeftsfuehrer}
                      onChange={(e) => setForm((p) => ({ ...p, istGeschaeftsfuehrer: e.target.checked }))}
                      className="w-4 h-4 rounded"
                      style={{ accentColor: 'var(--admin-accent)' }}
                    />
                    Geschäftsführer
                  </label>
                </div>
              </div>
              {formError && (
                <p className="text-sm" style={{ color: 'var(--drk)' }}>{formError}</p>
              )}
              <div className="flex items-center gap-2">
                <button type="submit" className="drk-btn-primary" disabled={submitting}>
                  {submitting ? 'Wird gespeichert…' : editId !== null ? 'Änderungen speichern' : 'Mitarbeiter anlegen'}
                </button>
                <button
                  type="button"
                  className="drk-btn-secondary"
                  onClick={() => {
                    setFormOffen(false);
                    setEditId(null);
                    setFormError(null);
                  }}
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <DataTable
            columns={COLUMNS}
            data={rows}
            loading={loading}
            pageSize={PAGE_SIZE}
            selectedId={selectedId}
            onRowClick={(row) => setSelectedId(row.id)}
            onRowDoubleClick={(row) => {
              setSelectedId(row.id);
              openEdit(row);
            }}
            totalItems={total}
            page={page}
            onPageChange={setPage}
            emptyMessage="Keine Mitarbeiter vorhanden."
          />
        </div>
      </div>
    </div>
  );
}
