'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CollapsibleSection from './CollapsibleSection';
import DataTable from './DataTable';
import StatusTabs from './StatusTabs';

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

interface HinweisFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<HinweisFormData>;
  hinweisId?: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const KATEGORIEN = [
  'Sexuelle Belästigung',
  'Diskriminierung',
  'Betrug / Untreue',
  'Korruption / Bestechung',
  'Datenschutzverstöße',
  'Arbeitsschutzverstöße',
  'Umweltverstöße',
  'Geldwäsche',
  'Steuerhinterziehung',
  'Verstöße gegen Vergaberecht',
  'Sonstige Verstöße',
];

const MELDEWEGE = ['Hinweisgebersystem', 'Telefon', 'Email', 'Post'];

function generateAktenzeichen(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let random = '';
  for (let i = 0; i < 8; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${y}-${m}-${d}-${random}`;
}

// ── Archiv Demo Data ───────────────────────────────────────────────────────

interface ArchivRow {
  id: number;
  art: string;
  ersteller: string;
  createdAt: string;
  meldung: string;
}

const ARCHIV_DEMO: ArchivRow[] = [];

const ARCHIV_COLUMNS = [
  { key: 'art', label: 'Art' },
  { key: 'ersteller', label: 'Ersteller' },
  { key: 'createdAt', label: 'Datum' },
  { key: 'meldung', label: 'Meldung', render: (row: ArchivRow) => (
    <span className="truncate block max-w-xs">{row.meldung || '—'}</span>
  )},
];

// ── Component ──────────────────────────────────────────────────────────────

export default function HinweisForm({ mode, initialData, hinweisId }: HinweisFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [archivTab, setArchivTab] = useState<string | null>(null);

  const [form, setForm] = useState<HinweisFormData>(() => ({
    istAnonym: false,
    kundeId: '',
    meldeweg: 'Hinweisgebersystem',
    aktenzeichen: mode === 'create' ? generateAktenzeichen() : '',
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

  // Exit guard for unsaved changes
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  function update(field: keyof HinweisFormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const endpoint = mode === 'create' ? '/api/admin/hinweise' : `/api/admin/hinweise/${hinweisId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          kundeId: form.kundeId ? Number(form.kundeId) : undefined,
          istAnonym: form.istAnonym,
        }),
      });
      if (res.ok) {
        router.push('/admin/hinweise');
      }
    } finally {
      setSaving(false);
    }
  }

  const archivFiltered = archivTab
    ? ARCHIV_DEMO.filter((a) => a.art === archivTab)
    : ARCHIV_DEMO;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-1" style={{ color: '#3d5a80' }}>
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
              Sie können hier Hinweise erfassen oder bearbeiten.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => router.push('/admin/hinweise')}
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
            {saving ? 'Speichert...' : 'Hinweis speichern'}
          </button>
        </div>
      </div>

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
                  style={{ accentColor: '#3d5a80' }}
                />
                Ja
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--text)' }}>
                <input
                  type="radio"
                  name="istAnonym"
                  checked={!form.istAnonym}
                  onChange={() => update('istAnonym', false)}
                  style={{ accentColor: '#3d5a80' }}
                />
                Nein
              </label>
            </div>
          </div>
          <div>
            <label className="drk-label">Anhang zur Meldung</label>
            <input type="file" className="drk-input text-sm" style={{ padding: '0.5rem 1rem' }} />
          </div>
          <div>
            <label className="drk-label">Organisation *</label>
            <select className="drk-input" value={form.kundeId} onChange={(e) => update('kundeId', e.target.value)}>
              <option value="">Bitte wählen...</option>
              <option value="1">DRK Kreisverband StädteRegion Aachen e.V.</option>
            </select>
          </div>
          <div>
            <label className="drk-label">Meldeweg</label>
            <select className="drk-input" value={form.meldeweg} onChange={(e) => update('meldeweg', e.target.value)}>
              {MELDEWEGE.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="drk-label">Aktenzeichen</label>
            <input
              type="text"
              className="drk-input"
              value={form.aktenzeichen}
              readOnly
              style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
            />
          </div>
          <div>
            <label className="drk-label">Status der Meldung</label>
            <select className="drk-input" value={form.status} onChange={(e) => update('status', e.target.value)}>
              <option value="Neu">Neu</option>
              <option value="InBearbeitung">In Bearbeitung</option>
              <option value="Abgeschlossen">Abgeschlossen</option>
            </select>
          </div>
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

      {/* Section 5: Archiv */}
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

      {/* Section 6: Was ist wichtig? */}
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

      {/* Section 7: Hinweisgeberschutzgesetz */}
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
