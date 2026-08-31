'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CollapsibleSection from './CollapsibleSection';
import DataTable from './DataTable';
import StatusTabs from './StatusTabs';
import { KATEGORIEN } from '@/lib/kategorien';

// ── Types ──────────────────────────────────────────────────────────────────

interface HinweisFormData {
  istAnonym: boolean;
  kundeId: string;
  meldeweg: string;
  aktenzeichen: string;
  status: string;
  hinweisgeberAnrede: string;
  hinweisgeberVorname: string;
  hinweisgeberNachname: string;
  hinweisgeberTelefon: string;
  hinweisgeberEmail: string;
  hinweisgeberAnmerkungen: string;
  meldungstext: string;
  beteiligte: string;
  kategorie: string;
  datumVerstoss: string;
}

export interface NachrichtRow {
  id: number;
  richtung: string;
  inhalt: string;
  ersteller: string;
  createdAt: string;
}

export interface ArchivRow {
  id: number;
  art: string;
  ersteller: string | null;
  createdAt: string;
  meldung: string | null;
}

export interface FristenInfo {
  createdAt: string;
  eingangsbestaetigungAm: string | null;
  eingangsbestaetigungFaelligAm: string | null;
  rueckmeldungAm: string | null;
  rueckmeldungFaelligAm: string | null;
}

interface AnhangRow {
  id: number;
  dateiname: string;
  groesse: number;
  hochgeladenVon: string;
  createdAt: string;
}

interface KundeOption {
  id: number;
  firma: string;
}

interface HinweisFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<HinweisFormData>;
  hinweisId?: number;
  nachrichten?: NachrichtRow[];
  archiv?: ArchivRow[];
  fristen?: FristenInfo;
  onReload?: () => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

// Manuell erfasste Meldungen kommen per Telefon, E-Mail oder Post herein;
// 'Hinweisgebersystem' vergibt nur der Intake selbst.
const MELDEWEGE_CREATE = ['Telefon', 'Email', 'Post'];
const MELDEWEGE_EDIT = ['Hinweisgebersystem', 'Telefon', 'Email', 'Post'];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatGroesse(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

const ARCHIV_COLUMNS = [
  { key: 'art', label: 'Art' },
  {
    key: 'ersteller',
    label: 'Ersteller',
    render: (row: ArchivRow) => row.ersteller ?? '—',
  },
  {
    key: 'createdAt',
    label: 'Datum',
    render: (row: ArchivRow) => formatDateTime(row.createdAt),
  },
  {
    key: 'meldung',
    label: 'Meldung',
    render: (row: ArchivRow) => (
      <span className="block max-w-md whitespace-normal">{row.meldung || '—'}</span>
    ),
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function HinweisForm({
  mode,
  initialData,
  hinweisId,
  nachrichten = [],
  archiv = [],
  fristen,
  onReload,
}: HinweisFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const [gespeichert, setGespeichert] = useState(false);
  const [archivTab, setArchivTab] = useState<string | null>(null);
  const [kunden, setKunden] = useState<KundeOption[]>([]);

  // Erfolgsansicht nach dem Anlegen (Zugangscode wird nur einmalig angezeigt)
  const [erfolg, setErfolg] = useState<{
    hinweisId: number;
    aktenzeichen: string;
    zugangscode: string;
  } | null>(null);

  const [form, setForm] = useState<HinweisFormData>(() => ({
    istAnonym: false,
    kundeId: '',
    meldeweg: mode === 'create' ? 'Telefon' : 'Hinweisgebersystem',
    aktenzeichen: '',
    status: 'Neu',
    hinweisgeberAnrede: '',
    hinweisgeberVorname: '',
    hinweisgeberNachname: '',
    hinweisgeberTelefon: '',
    hinweisgeberEmail: '',
    hinweisgeberAnmerkungen: '',
    meldungstext: '',
    beteiligte: '',
    kategorie: '',
    datumVerstoss: '',
    ...initialData,
  }));

  // Dirty-Tracking: Exit-Guard nur bei tatsächlich geänderten Feldern
  const dirtyRef = useRef(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Organisationen für die Auswahl laden
  useEffect(() => {
    let aktiv = true;
    (async () => {
      try {
        const res = await fetch('/api/admin/kunden?limit=100');
        if (!res.ok) return;
        const json = await res.json();
        if (aktiv) setKunden(json.data ?? []);
      } catch {
        // Auswahl bleibt leer
      }
    })();
    return () => {
      aktiv = false;
    };
  }, []);

  function update(field: keyof HinweisFormData, value: string | boolean) {
    dirtyRef.current = true;
    setDirty(true);
    setGespeichert(false);
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function baueBody(): Record<string, unknown> {
    const body: Record<string, unknown> = {
      istAnonym: form.istAnonym,
      kundeId: Number(form.kundeId),
      meldeweg: form.meldeweg,
      meldungstext: form.meldungstext,
    };
    if (form.kategorie) body.kategorie = form.kategorie;
    if (form.datumVerstoss) body.datumVerstoss = form.datumVerstoss;
    if (form.beteiligte) body.beteiligte = form.beteiligte;
    if (!form.istAnonym) {
      if (form.hinweisgeberAnrede) body.hinweisgeberAnrede = form.hinweisgeberAnrede;
      body.hinweisgeberVorname = form.hinweisgeberVorname;
      body.hinweisgeberNachname = form.hinweisgeberNachname;
      body.hinweisgeberTelefon = form.hinweisgeberTelefon;
      body.hinweisgeberEmail = form.hinweisgeberEmail;
      body.hinweisgeberAnmerkungen = form.hinweisgeberAnmerkungen;
    } else if (mode === 'edit') {
      // Wechsel auf anonym: PII-Felder serverseitig leeren (encryptField('') → null)
      body.hinweisgeberVorname = '';
      body.hinweisgeberNachname = '';
      body.hinweisgeberTelefon = '';
      body.hinweisgeberEmail = '';
      body.hinweisgeberAnmerkungen = '';
    }
    if (mode === 'edit') {
      body.status = form.status;
    }
    return body;
  }

  async function handleSave() {
    setFehler(null);
    if (!form.kundeId) {
      setFehler('Bitte wählen Sie eine Organisation aus.');
      return;
    }
    if (!form.meldungstext.trim()) {
      setFehler('Bitte geben Sie einen Meldungstext ein.');
      return;
    }

    setSaving(true);
    try {
      const endpoint = mode === 'create' ? '/api/admin/hinweise' : `/api/admin/hinweise/${hinweisId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(baueBody()),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setFehler(json?.error ?? 'Speichern fehlgeschlagen.');
        return;
      }

      dirtyRef.current = false;
      setDirty(false);

      if (mode === 'create') {
        const json = await res.json();
        setErfolg({
          hinweisId: json.data?.id,
          aktenzeichen: json.aktenzeichen,
          zugangscode: json.zugangscode,
        });
      } else {
        setGespeichert(true);
        onReload?.();
      }
    } catch {
      setFehler('Speichern fehlgeschlagen.');
    } finally {
      setSaving(false);
    }
  }

  function handleVerwerfen() {
    if (dirty && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return;
    dirtyRef.current = false;
    router.push('/admin/hinweise');
  }

  // ── Erfolgsansicht nach dem Anlegen ──────────────────────────────────────

  if (erfolg) {
    return (
      <div className="max-w-2xl space-y-6">
        <div
          className="rounded-lg px-5 py-4"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          <h1 className="text-lg font-bold mb-1">Hinweis erfolgreich erfasst</h1>
          <p className="text-sm">
            Aktenzeichen: <strong className="font-mono">{erfolg.aktenzeichen}</strong>
          </p>
        </div>

        <div
          className="rounded-lg px-5 py-4"
          style={{ background: 'var(--warning-bg)', border: '1px solid var(--warning-border)', color: 'var(--warning-text)' }}
        >
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2">
            Zugangscode für den Hinweisgeber
          </h2>
          <div
            className="font-mono text-2xl font-bold tracking-widest mb-3 select-all"
            style={{ color: 'var(--warning-text)' }}
          >
            {erfolg.zugangscode}
          </div>
          <p className="text-sm leading-relaxed">
            Dieser Zugangscode wird <strong>nur einmalig</strong> angezeigt und kann später nicht
            erneut abgerufen werden. Händigen Sie ihn zusammen mit dem Aktenzeichen dem
            Hinweisgeber aus — damit kann er im Postfach den Bearbeitungsstand einsehen und
            Rückfragen beantworten.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {erfolg.hinweisId && (
            <Link
              href={`/admin/hinweise/${erfolg.hinweisId}`}
              className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
            >
              Zum Hinweis
            </Link>
          )}
          <Link
            href="/admin/hinweise"
            className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              minHeight: '44px',
            }}
          >
            Zur Übersicht
          </Link>
        </div>
      </div>
    );
  }

  const archivFiltered = archivTab ? archiv.filter((a) => a.art === archivTab) : archiv;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: 'var(--admin-accent)' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              {mode === 'create' ? 'Hinweis erfassen' : 'Hinweis bearbeiten'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {mode === 'edit' && form.aktenzeichen
                ? `Aktenzeichen ${form.aktenzeichen}`
                : 'Sie können hier Hinweise erfassen oder bearbeiten.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleVerwerfen}
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
            {saving ? 'Speichert...' : 'Hinweis speichern'}
          </button>
        </div>
      </div>

      {/* Meldungen */}
      {fehler && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
        >
          {fehler}
        </div>
      )}
      {gespeichert && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)' }}
        >
          Änderungen gespeichert.
        </div>
      )}

      {/* Fristen-Infobox */}
      {mode === 'edit' && fristen && <FristenBox fristen={fristen} />}

      {/* Section 1: Allgemeine Daten */}
      <CollapsibleSection title="Allgemeine Daten">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="drk-label">Anonyme Meldung</label>
            <div className="flex items-center gap-4 mt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text)' }}>
                <input
                  type="radio"
                  name="istAnonym"
                  checked={form.istAnonym}
                  onChange={() => update('istAnonym', true)}
                  style={{ accentColor: 'var(--admin-accent)' }}
                />
                Ja
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text)' }}>
                <input
                  type="radio"
                  name="istAnonym"
                  checked={!form.istAnonym}
                  onChange={() => update('istAnonym', false)}
                  style={{ accentColor: 'var(--admin-accent)' }}
                />
                Nein
              </label>
            </div>
          </div>
          <div>
            <label className="drk-label">Organisation *</label>
            <select className="drk-input" value={form.kundeId} onChange={(e) => update('kundeId', e.target.value)}>
              <option value="">Bitte wählen...</option>
              {kunden.map((k) => (
                <option key={k.id} value={String(k.id)}>{k.firma}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="drk-label">Meldeweg</label>
            <select className="drk-input" value={form.meldeweg} onChange={(e) => update('meldeweg', e.target.value)}>
              {(mode === 'create' ? MELDEWEGE_CREATE : MELDEWEGE_EDIT).map((m) => (
                <option key={m} value={m}>{m === 'Email' ? 'E-Mail' : m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="drk-label">Aktenzeichen</label>
            <input
              type="text"
              className="drk-input"
              value={mode === 'create' ? 'wird automatisch vergeben' : form.aktenzeichen}
              readOnly
              style={{ background: 'var(--bg-secondary)', cursor: 'not-allowed' }}
            />
          </div>
          {mode === 'edit' && (
            <div>
              <label className="drk-label">Status der Meldung</label>
              <select className="drk-input" value={form.status} onChange={(e) => update('status', e.target.value)}>
                <option value="Neu">Neu</option>
                <option value="InBearbeitung">In Bearbeitung</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
              </select>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Section 2 & 3: Personal Data + Contact (side by side) */}
      {!form.istAnonym && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CollapsibleSection title="Persönliche Daten">
            <div className="space-y-4">
              <div>
                <label className="drk-label">Anrede</label>
                <select className="drk-input" value={form.hinweisgeberAnrede} onChange={(e) => update('hinweisgeberAnrede', e.target.value)}>
                  <option value="">Bitte wählen...</option>
                  <option value="Frau">Frau</option>
                  <option value="Herr">Herr</option>
                </select>
              </div>
              <div>
                <label className="drk-label">Vorname</label>
                <input type="text" className="drk-input" value={form.hinweisgeberVorname} onChange={(e) => update('hinweisgeberVorname', e.target.value)} />
              </div>
              <div>
                <label className="drk-label">Nachname</label>
                <input type="text" className="drk-input" value={form.hinweisgeberNachname} onChange={(e) => update('hinweisgeberNachname', e.target.value)} />
              </div>
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Kontaktmöglichkeiten">
            <div className="space-y-4">
              <div>
                <label className="drk-label">Telefon</label>
                <input type="tel" className="drk-input" value={form.hinweisgeberTelefon} onChange={(e) => update('hinweisgeberTelefon', e.target.value)} />
              </div>
              <div>
                <label className="drk-label">E-Mail</label>
                <input type="email" className="drk-input" value={form.hinweisgeberEmail} onChange={(e) => update('hinweisgeberEmail', e.target.value)} />
              </div>
              <div>
                <label className="drk-label">Anmerkungen</label>
                <textarea className="drk-input" rows={3} value={form.hinweisgeberAnmerkungen} onChange={(e) => update('hinweisgeberAnmerkungen', e.target.value)} />
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}

      {/* Section 4: Daten zum Hinweis */}
      <CollapsibleSection title="Daten zum Hinweis">
        <div className="space-y-4">
          <div>
            <label className="drk-label">Meldungstext *</label>
            <textarea className="drk-input" rows={8} value={form.meldungstext} onChange={(e) => update('meldungstext', e.target.value)} placeholder="Beschreibung des Sachverhalts..." />
          </div>
          <div>
            <label className="drk-label">Beteiligte</label>
            <textarea className="drk-input" rows={3} value={form.beteiligte} onChange={(e) => update('beteiligte', e.target.value)} placeholder="Beteiligte Personen..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="drk-label">Kategorie der Meldung</label>
              <select className="drk-input" value={form.kategorie} onChange={(e) => update('kategorie', e.target.value)}>
                <option value="">Bitte wählen...</option>
                {KATEGORIEN.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="drk-label">Datum des Verstoßes</label>
              <input type="date" className="drk-input" value={form.datumVerstoss} onChange={(e) => update('datumVerstoss', e.target.value)} />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* Section 5: Kommunikation mit Hinweisgeber */}
      {mode === 'edit' && hinweisId && (
        <KommunikationSection
          hinweisId={hinweisId}
          nachrichten={nachrichten}
          onReload={onReload}
        />
      )}

      {/* Section 6: Anhänge */}
      {mode === 'edit' && hinweisId && (
        <AnhaengeSection hinweisId={hinweisId} onReload={onReload} />
      )}

      {/* Section 7: Archiv */}
      {mode === 'edit' && (
        <CollapsibleSection title="Archiv" defaultOpen={false}>
          <StatusTabs
            tabs={['Kommunikation', 'Mail', 'Log']}
            active={archivTab}
            onChange={setArchivTab}
          />
          <div className="mt-3">
            <DataTable
              columns={ARCHIV_COLUMNS}
              data={archivFiltered}
              pageSize={10}
              emptyMessage="Keine Archiv-Einträge vorhanden."
            />
          </div>
        </CollapsibleSection>
      )}

      {/* Section 8: Was ist wichtig? */}
      <CollapsibleSection title="Was ist wichtig?" defaultOpen={false}>
        <div className="text-sm space-y-2" style={{ color: 'var(--text-light)' }}>
          <p>
            Bei der Erfassung eines Hinweises ist es besonders wichtig, den Sachverhalt so detailliert
            und präzise wie möglich zu beschreiben. Folgende Punkte sollten berücksichtigt werden:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Was genau ist passiert? Beschreiben Sie den Vorfall möglichst genau.</li>
            <li>Wann hat sich der Vorfall ereignet? Geben Sie möglichst genaue Zeitangaben an.</li>
            <li>Wer war beteiligt? Nennen Sie beteiligte Personen, soweit bekannt.</li>
            <li>Gibt es Belege oder Nachweise? Fügen Sie Anhänge bei, wenn möglich.</li>
            <li>Ist der Vorfall einmalig oder wiederholend?</li>
          </ul>
          <p>
            Die Eingangsbestätigung muss innerhalb von 7 Tagen an den Hinweisgeber erfolgen.
            Innerhalb von 3 Monaten muss eine Rückmeldung zu ergriffenen Maßnahmen gegeben werden.
          </p>
        </div>
      </CollapsibleSection>

      {/* Section 9: Hinweisgeberschutzgesetz */}
      <CollapsibleSection title="Hinweisgeberschutzgesetz" defaultOpen={false}>
        <div className="text-sm space-y-2" style={{ color: 'var(--text-light)' }}>
          <p>
            Das Hinweisgeberschutzgesetz (HinSchG) ist am 2. Juli 2023 in Kraft getreten und setzt
            die EU-Whistleblower-Richtlinie (2019/1937) in deutsches Recht um. Es schützt Personen,
            die im Rahmen ihrer beruflichen Tätigkeit Informationen über Verstöße erlangt haben und
            diese melden.
          </p>
          <p>
            <strong>Geschützte Personen:</strong> Arbeitnehmer, Beamte, Auszubildende, Selbstständige,
            Gesellschafter, Ehrenamtliche, Bewerber und ehemalige Beschäftigte.
          </p>
          <p>
            <strong>Erfasste Verstöße:</strong> Strafvorschriften, Arbeitsschutz, Datenschutz,
            Umweltschutz, Verbraucherschutz, Vergaberecht, Geldwäsche und weitere.
          </p>
          <p>
            <strong>Verbotene Repressalien:</strong> Kündigung, Abmahnung, Versetzung, Mobbing und
            jede andere Form der Benachteiligung aufgrund einer Meldung.
          </p>
          <p>
            <strong>Fristen:</strong> Eingangsbestätigung binnen 7 Tagen. Rückmeldung über ergriffene
            Maßnahmen binnen 3 Monaten nach Eingangsbestätigung.
          </p>
        </div>
      </CollapsibleSection>
    </div>
  );
}

// ── Fristen-Infobox ────────────────────────────────────────────────────────

function FristenBox({ fristen }: { fristen: FristenInfo }) {
  const jetzt = Date.now();

  const eingangsbestaetigungOffen =
    !fristen.eingangsbestaetigungAm && fristen.eingangsbestaetigungFaelligAm !== null;
  const eingangsbestaetigungUeberfaellig =
    eingangsbestaetigungOffen &&
    new Date(fristen.eingangsbestaetigungFaelligAm!).getTime() < jetzt;

  const rueckmeldungOffen = !fristen.rueckmeldungAm && fristen.rueckmeldungFaelligAm !== null;
  const rueckmeldungUeberfaellig =
    rueckmeldungOffen && new Date(fristen.rueckmeldungFaelligAm!).getTime() < jetzt;

  return (
    <div
      className="rounded-lg px-4 py-3"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-sm font-bold mb-2" style={{ color: 'var(--text)' }}>
        Fristen nach § 17 HinSchG
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Eingang</div>
          <div style={{ color: 'var(--text)' }}>{formatDateTime(fristen.createdAt)}</div>
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Eingangsbestätigung am</div>
          {fristen.eingangsbestaetigungAm ? (
            <div style={{ color: 'var(--text)' }}>{formatDate(fristen.eingangsbestaetigungAm)}</div>
          ) : (
            <div
              className={eingangsbestaetigungUeberfaellig ? 'font-semibold' : undefined}
              style={{ color: eingangsbestaetigungUeberfaellig ? '#dc2626' : 'var(--text)' }}
            >
              noch nicht versendet
              {fristen.eingangsbestaetigungFaelligAm && (
                <> (fällig am {formatDate(fristen.eingangsbestaetigungFaelligAm)})</>
              )}
              {eingangsbestaetigungUeberfaellig && ' — überfällig'}
            </div>
          )}
        </div>
        <div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Rückmeldung fällig am</div>
          {fristen.rueckmeldungAm ? (
            <div style={{ color: 'var(--text)' }}>
              erfolgt am {formatDate(fristen.rueckmeldungAm)}
            </div>
          ) : (
            <div
              className={rueckmeldungUeberfaellig ? 'font-semibold' : undefined}
              style={{ color: rueckmeldungUeberfaellig ? '#dc2626' : 'var(--text)' }}
            >
              {fristen.rueckmeldungFaelligAm ? formatDate(fristen.rueckmeldungFaelligAm) : '—'}
              {rueckmeldungUeberfaellig && ' — überfällig'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Kommunikation mit Hinweisgeber ─────────────────────────────────────────

function KommunikationSection({
  hinweisId,
  nachrichten,
  onReload,
}: {
  hinweisId: number;
  nachrichten: NachrichtRow[];
  onReload?: () => void;
}) {
  const [inhalt, setInhalt] = useState('');
  const [alsRueckmeldung, setAlsRueckmeldung] = useState(false);
  const [senden, setSenden] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function handleSenden() {
    if (!inhalt.trim()) {
      setFehler('Die Nachricht darf nicht leer sein.');
      return;
    }
    setFehler(null);
    setSenden(true);
    try {
      const res = await fetch(`/api/admin/hinweise/${hinweisId}/nachricht`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inhalt: inhalt.trim(), alsRueckmeldung }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setFehler(json?.error ?? 'Die Nachricht konnte nicht gesendet werden.');
        return;
      }
      setInhalt('');
      setAlsRueckmeldung(false);
      onReload?.();
    } catch {
      setFehler('Die Nachricht konnte nicht gesendet werden.');
    } finally {
      setSenden(false);
    }
  }

  return (
    <CollapsibleSection title="Kommunikation mit Hinweisgeber">
      <div className="space-y-4">
        {/* Thread */}
        {nachrichten.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Noch keine Nachrichten vorhanden.
          </p>
        ) : (
          <div className="space-y-3">
            {nachrichten.map((n) => {
              const vonHinweisgeber = n.richtung === 'VonHinweisgeber';
              return (
                <div
                  key={n.id}
                  className={`flex ${vonHinweisgeber ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className="max-w-[85%] rounded-lg px-3.5 py-2.5"
                    style={{
                      background: vonHinweisgeber ? 'var(--bg-secondary)' : 'var(--admin-selected)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: vonHinweisgeber ? 'var(--text)' : 'var(--admin-accent)' }}
                      >
                        {vonHinweisgeber ? 'Hinweisgeber' : `Meldestelle (${n.ersteller})`}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatDateTime(n.createdAt)}
                      </span>
                    </div>
                    <p
                      className="text-sm whitespace-pre-wrap leading-relaxed"
                      style={{ color: 'var(--text)' }}
                    >
                      {n.inhalt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Neue Nachricht */}
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          {fehler && (
            <div
              className="rounded px-3 py-2 text-sm"
              style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
            >
              {fehler}
            </div>
          )}
          <label className="drk-label">Nachricht an den Hinweisgeber</label>
          <textarea
            className="drk-input"
            rows={4}
            value={inhalt}
            onChange={(e) => setInhalt(e.target.value)}
            placeholder="Ihre Nachricht an den Hinweisgeber..."
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text)' }}>
            <input
              type="checkbox"
              checked={alsRueckmeldung}
              onChange={(e) => setAlsRueckmeldung(e.target.checked)}
              style={{ accentColor: 'var(--admin-accent)' }}
            />
            Als Rückmeldung nach § 17 Abs. 2 markieren
          </label>
          <div>
            <button
              type="button"
              onClick={handleSenden}
              disabled={senden || !inhalt.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
            >
              {senden ? 'Sendet...' : 'Nachricht senden'}
            </button>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}

// ── Anhänge ────────────────────────────────────────────────────────────────

function AnhaengeSection({
  hinweisId,
  onReload,
}: {
  hinweisId: number;
  onReload?: () => void;
}) {
  const [anhaenge, setAnhaenge] = useState<AnhangRow[]>([]);
  const [datei, setDatei] = useState<File | null>(null);
  const [hochladen, setHochladen] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
  const dateiInputRef = useRef<HTMLInputElement>(null);

  const fetchAnhaenge = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/hinweise/${hinweisId}/anhang`);
      if (!res.ok) return;
      const json = await res.json();
      setAnhaenge(json.data ?? []);
    } catch {
      // Liste bleibt leer
    }
  }, [hinweisId]);

  useEffect(() => {
    fetchAnhaenge();
  }, [fetchAnhaenge]);

  async function handleUpload() {
    if (!datei) return;
    setFehler(null);
    setHochladen(true);
    try {
      const formData = new FormData();
      formData.append('datei', datei);
      const res = await fetch(`/api/admin/hinweise/${hinweisId}/anhang`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setFehler(json?.error ?? 'Der Anhang konnte nicht hochgeladen werden.');
        return;
      }
      setDatei(null);
      if (dateiInputRef.current) dateiInputRef.current.value = '';
      await fetchAnhaenge();
      onReload?.();
    } catch {
      setFehler('Der Anhang konnte nicht hochgeladen werden.');
    } finally {
      setHochladen(false);
    }
  }

  return (
    <CollapsibleSection title="Anhänge">
      <div className="space-y-4">
        {anhaenge.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Keine Anhänge vorhanden.
          </p>
        ) : (
          <ul className="space-y-2">
            {anhaenge.map((a) => (
              <li
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg px-3.5 py-2.5"
                style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
              >
                <div className="min-w-0">
                  <a
                    href={`/api/admin/anhaenge/${a.id}`}
                    className="text-sm font-medium underline break-all"
                    style={{ color: 'var(--admin-accent)' }}
                  >
                    {a.dateiname}
                  </a>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {formatGroesse(a.groesse)} · hochgeladen von {a.hochgeladenVon} am{' '}
                    {formatDateTime(a.createdAt)}
                  </div>
                </div>
                <a
                  href={`/api/admin/anhaenge/${a.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium shrink-0 transition-colors self-start"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Herunterladen
                </a>
              </li>
            ))}
          </ul>
        )}

        {/* Upload */}
        <div className="space-y-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          {fehler && (
            <div
              className="rounded px-3 py-2 text-sm"
              style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
            >
              {fehler}
            </div>
          )}
          <label className="drk-label">Neuen Anhang hochladen</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={dateiInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.docx,.xlsx"
              className="drk-input text-sm flex-1"
              style={{ padding: '0.5rem 1rem' }}
              onChange={(e) => setDatei(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={!datei || hochladen}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50 shrink-0"
              style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
            >
              {hochladen ? 'Lädt hoch...' : 'Hochladen'}
            </button>
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Erlaubt: PDF, JPG, PNG, WebP, TXT, DOCX, XLSX — maximal 10 MB.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
