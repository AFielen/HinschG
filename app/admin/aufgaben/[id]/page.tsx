'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CollapsibleSection from '@/components/admin/CollapsibleSection';
import StatusBadge from '@/components/admin/StatusBadge';

// ── Types ──────────────────────────────────────────────────────────────────

interface AufgabeDetail {
  id: number;
  titel: string;
  beschreibung: string | null;
  status: string;
  schritt: number;
  schrittName: string | null;
  faelligBis: string | null;
  startDatum: string | null;
  erledigtAm: string | null;
  hinweisId: number;
  aktenzeichen: string | null;
  bearbeiterId: number | null;
  bearbeiterName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BenutzerOption {
  id: number;
  displayName: string | null;
  username: string;
}

// Die vier festen Workflow-Schritte des HinSchG-Prozesses
const WORKFLOW_SCHRITTE = [
  'Relevanzprüfung',
  'Sachverhaltsermittlung',
  'Folgemaßnahmen',
  'Abschluss',
];

const TAG_MS = 24 * 60 * 60 * 1000;

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

/** Fälligkeits-Farbe: überfällig rot, in ≤ 3 Tagen fällig gelb. */
function faelligkeitsFarbe(faelligBis: string, erledigt: boolean): string | undefined {
  if (erledigt) return undefined;
  const rest = new Date(faelligBis).getTime() - Date.now();
  if (rest < 0) return '#dc2626';
  if (rest <= 3 * TAG_MS) return '#d97706';
  return undefined;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AufgabeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [aufgabe, setAufgabe] = useState<AufgabeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);
  const [aktion, setAktion] = useState(false);

  // Bearbeiten-Panel
  const [bearbeiten, setBearbeiten] = useState(false);
  const [editTitel, setEditTitel] = useState('');
  const [editBeschreibung, setEditBeschreibung] = useState('');
  const [editFaelligBis, setEditFaelligBis] = useState('');

  // Zuweisen-Panel
  const [zuweisen, setZuweisen] = useState(false);
  const [benutzer, setBenutzer] = useState<BenutzerOption[]>([]);
  const [zuweisungId, setZuweisungId] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/aufgaben/${id}`);
      if (res.status === 404) {
        setFehler('Die Aufgabe wurde nicht gefunden.');
        return;
      }
      if (!res.ok) {
        setFehler('Die Aufgabe konnte nicht geladen werden.');
        return;
      }
      setAufgabe(await res.json());
      setFehler(null);
    } catch {
      setFehler('Die Aufgabe konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Benutzer-Auswahl für die Zuweisung laden (für jeden eingeloggten Benutzer)
  useEffect(() => {
    if (!zuweisen || benutzer.length > 0) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/users?zweck=zuweisung');
        if (!res.ok) return;
        const json = await res.json();
        setBenutzer(json.data ?? []);
      } catch {
        // Auswahl bleibt leer
      }
    })();
  }, [zuweisen, benutzer.length]);

  async function sendePut(body: Record<string, unknown>, fehlermeldung: string): Promise<boolean> {
    setFehler(null);
    setAktion(true);
    try {
      const res = await fetch(`/api/admin/aufgaben/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setFehler(json?.error ?? fehlermeldung);
        return false;
      }
      await fetchData();
      return true;
    } catch {
      setFehler(fehlermeldung);
      return false;
    } finally {
      setAktion(false);
    }
  }

  function handleBearbeitenOeffnen() {
    if (!aufgabe) return;
    setEditTitel(aufgabe.titel);
    setEditBeschreibung(aufgabe.beschreibung ?? '');
    setEditFaelligBis(aufgabe.faelligBis ? aufgabe.faelligBis.slice(0, 10) : '');
    setBearbeiten(true);
    setZuweisen(false);
  }

  async function handleBearbeitenSpeichern() {
    if (!editTitel.trim()) {
      setFehler('Der Titel darf nicht leer sein.');
      return;
    }
    const ok = await sendePut(
      {
        titel: editTitel.trim(),
        beschreibung: editBeschreibung,
        faelligBis: editFaelligBis || null,
      },
      'Die Aufgabe konnte nicht gespeichert werden.',
    );
    if (ok) setBearbeiten(false);
  }

  function handleZuweisenOeffnen() {
    if (!aufgabe) return;
    setZuweisungId(aufgabe.bearbeiterId !== null ? String(aufgabe.bearbeiterId) : '');
    setZuweisen(true);
    setBearbeiten(false);
  }

  async function handleZuweisenSpeichern() {
    const ok = await sendePut(
      { bearbeiterId: zuweisungId ? Number(zuweisungId) : null },
      'Der Bearbeiter konnte nicht zugewiesen werden.',
    );
    if (ok) setZuweisen(false);
  }

  async function handleAbschliessen() {
    if (!window.confirm('Aufgabe wirklich abschließen?')) return;
    await sendePut({ status: 'Abgeschlossen' }, 'Die Aufgabe konnte nicht abgeschlossen werden.');
  }

  async function handleEntscheidung(relevant: boolean) {
    if (
      !relevant &&
      !window.confirm(
        'Meldung als nicht relevant einstufen? Aufgabe und Hinweis werden abgeschlossen.',
      )
    ) {
      return;
    }
    setFehler(null);
    setAktion(true);
    try {
      const res = await fetch(`/api/admin/aufgaben/${id}/entscheidung`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relevant }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        setFehler(json?.error ?? 'Die Entscheidung konnte nicht gespeichert werden.');
        return;
      }
      await fetchData();
    } catch {
      setFehler('Die Entscheidung konnte nicht gespeichert werden.');
    } finally {
      setAktion(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg"
            style={{
              background: 'var(--bg)',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 1 - i * 0.2,
            }}
          />
        ))}
      </div>
    );
  }

  const abgeschlossen = aufgabe?.status === 'Abgeschlossen';
  const faelligFarbe =
    aufgabe?.faelligBis != null
      ? faelligkeitsFarbe(aufgabe.faelligBis, abgeschlossen)
      : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/admin/aufgaben')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Zurück"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: 'var(--text-light)' }}
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--text)' }}
            >
              {aufgabe?.titel ?? `Aufgabe #${id}`}
            </h1>
            {aufgabe?.aktenzeichen && (
              <p
                className="text-sm mt-0.5"
                style={{ color: 'var(--text-light)' }}
              >
                Hinweis:{' '}
                <Link
                  href={`/admin/hinweise/${aufgabe.hinweisId}`}
                  className="underline"
                  style={{ color: '#3d5a80' }}
                >
                  {aufgabe.aktenzeichen}
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          {aufgabe && <StatusBadge status={aufgabe.status} />}
        </div>
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

      {!aufgabe ? (
        <Link
          href="/admin/aufgaben"
          className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: '#3d5a80', minHeight: '44px' }}
        >
          Zur Übersicht
        </Link>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Case details */}
          <div className="lg:col-span-2 space-y-4">
            {/* Aufgabe Details */}
            <CollapsibleSection title="Aufgaben-Details" defaultOpen>
              <div className="space-y-4">
                <DetailRow label="Titel" value={aufgabe.titel} />
                <DetailRow label="Status">
                  <StatusBadge status={aufgabe.status} />
                </DetailRow>
                <DetailRow
                  label="Schritt"
                  value={
                    aufgabe.schrittName
                      ? `${aufgabe.schritt} — ${aufgabe.schrittName}`
                      : String(aufgabe.schritt)
                  }
                />
                <DetailRow label="Fällig bis">
                  {aufgabe.faelligBis ? (
                    <span
                      className={`text-sm ${faelligFarbe ? 'font-semibold' : ''}`}
                      style={{ color: faelligFarbe ?? 'var(--text-light)' }}
                    >
                      {formatDate(aufgabe.faelligBis)}
                      {faelligFarbe === '#dc2626' && ' — überfällig'}
                    </span>
                  ) : (
                    <span className="text-sm" style={{ color: 'var(--text-light)' }}>—</span>
                  )}
                </DetailRow>
                <DetailRow
                  label="Erstellt am"
                  value={formatDateTime(aufgabe.createdAt)}
                />
                {aufgabe.erledigtAm && (
                  <DetailRow
                    label="Erledigt am"
                    value={formatDateTime(aufgabe.erledigtAm)}
                  />
                )}
                <DetailRow
                  label="Bearbeiter"
                  value={aufgabe.bearbeiterName}
                />
              </div>
            </CollapsibleSection>

            {/* Beschreibung */}
            <CollapsibleSection title="Beschreibung" defaultOpen>
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text-light)' }}
              >
                {aufgabe.beschreibung || (
                  <span style={{ color: 'var(--text-muted)' }}>
                    Keine Beschreibung vorhanden.
                  </span>
                )}
              </div>
            </CollapsibleSection>

            {/* Bearbeiten-Panel */}
            {bearbeiten && (
              <CollapsibleSection title="Aufgabe bearbeiten" defaultOpen>
                <div className="space-y-4">
                  <div>
                    <label className="drk-label">Titel *</label>
                    <input
                      type="text"
                      className="drk-input"
                      value={editTitel}
                      onChange={(e) => setEditTitel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="drk-label">Beschreibung</label>
                    <textarea
                      className="drk-input"
                      rows={4}
                      value={editBeschreibung}
                      onChange={(e) => setEditBeschreibung(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="drk-label">Fällig bis</label>
                    <input
                      type="date"
                      className="drk-input"
                      value={editFaelligBis}
                      onChange={(e) => setEditFaelligBis(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleBearbeitenSpeichern}
                      disabled={aktion}
                      className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#3d5a80', minHeight: '44px' }}
                    >
                      {aktion ? 'Speichert...' : 'Speichern'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setBearbeiten(false)}
                      className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        minHeight: '44px',
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* Zuweisen-Panel */}
            {zuweisen && (
              <CollapsibleSection title="Bearbeiter zuweisen" defaultOpen>
                <div className="space-y-4">
                  <div>
                    <label className="drk-label">Bearbeiter</label>
                    <select
                      className="drk-input"
                      value={zuweisungId}
                      onChange={(e) => setZuweisungId(e.target.value)}
                    >
                      <option value="">— nicht zugewiesen —</option>
                      {benutzer.map((b) => (
                        <option key={b.id} value={String(b.id)}>
                          {b.displayName || b.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleZuweisenSpeichern}
                      disabled={aktion}
                      className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                      style={{ background: '#3d5a80', minHeight: '44px' }}
                    >
                      {aktion ? 'Speichert...' : 'Zuweisen'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setZuweisen(false)}
                      className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                      style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text)',
                        border: '1px solid var(--border)',
                        minHeight: '44px',
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </CollapsibleSection>
            )}

            {/* Entscheidung bei Relevanzprüfung */}
            {aufgabe.schritt === 1 && !abgeschlossen && (
              <div
                className="rounded-lg px-4 py-4"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <h2 className="text-sm font-bold mb-1" style={{ color: 'var(--text)' }}>
                  Relevanzprüfung
                </h2>
                <p className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>
                  Fällt die Meldung in den Anwendungsbereich des HinSchG und ist sie stichhaltig?
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEntscheidung(true)}
                    disabled={aktion}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#059669', minHeight: '44px' }}
                  >
                    Relevant → Sachverhaltsermittlung
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEntscheidung(false)}
                    disabled={aktion}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ background: '#dc2626', minHeight: '44px' }}
                  >
                    Nicht relevant → Abschließen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right column: Workflow Sidebar */}
          <div className="space-y-4">
            {/* Workflow Steps */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="px-4 py-3 text-sm font-semibold"
                style={{ background: '#3d5a80', color: '#ffffff' }}
              >
                Workflow-Schritte
              </div>
              <div style={{ background: 'var(--bg-card)' }}>
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {WORKFLOW_SCHRITTE.map((name, idx) => (
                    <WorkflowStep
                      key={name}
                      name={name}
                      nummer={idx + 1}
                      isComplete={idx + 1 < aufgabe.schritt || abgeschlossen}
                      isActive={idx + 1 === aufgabe.schritt && !abgeschlossen}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="px-4 py-3 text-sm font-semibold"
                style={{ background: '#3d5a80', color: '#ffffff' }}
              >
                Aktionen
              </div>
              <div className="p-4 space-y-2" style={{ background: 'var(--bg-card)' }}>
                <ActionButton
                  label="Aufgabe bearbeiten"
                  onClick={handleBearbeitenOeffnen}
                  icon={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  }
                />
                <ActionButton
                  label="Bearbeiter zuweisen"
                  onClick={handleZuweisenOeffnen}
                  icon={
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  }
                />
                {!abgeschlossen && (
                  <ActionButton
                    label="Abschließen"
                    onClick={handleAbschliessen}
                    icon={
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    }
                  />
                )}
              </div>
            </div>

            {/* Hinweis Link */}
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border)' }}
            >
              <div
                className="px-4 py-3 text-sm font-semibold"
                style={{ background: '#3d5a80', color: '#ffffff' }}
              >
                Zugehöriger Hinweis
              </div>
              <div className="p-4" style={{ background: 'var(--bg-card)' }}>
                <Link
                  href={`/admin/hinweise/${aufgabe.hinweisId}`}
                  className="inline-flex items-center gap-2 text-sm font-medium underline"
                  style={{ color: '#3d5a80' }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  {aufgabe.aktenzeichen ?? `Hinweis #${aufgabe.hinweisId}`}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
      <span
        className="text-sm font-semibold sm:w-36 shrink-0"
        style={{ color: 'var(--text)' }}
      >
        {label}
      </span>
      {children ?? (
        <span className="text-sm" style={{ color: 'var(--text-light)' }}>
          {value ?? '—'}
        </span>
      )}
    </div>
  );
}

function WorkflowStep({
  name,
  nummer,
  isComplete,
  isActive,
}: {
  name: string;
  nummer: number;
  isComplete: boolean;
  isActive: boolean;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        background: isActive ? '#f0f5ff' : 'transparent',
      }}
    >
      {/* Step indicator */}
      <div
        className="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-bold"
        style={{
          background: isComplete ? '#059669' : isActive ? '#3d5a80' : 'var(--bg)',
          color: isComplete || isActive ? '#ffffff' : 'var(--text-muted)',
          border:
            !isComplete && !isActive
              ? '2px solid var(--border)'
              : 'none',
        }}
      >
        {isComplete ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          nummer
        )}
      </div>

      {/* Step info */}
      <p
        className="text-sm font-medium min-w-0 flex-1"
        style={{
          color: isActive
            ? '#3d5a80'
            : isComplete
              ? 'var(--text)'
              : 'var(--text-muted)',
        }}
      >
        {name}
      </p>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-colors text-left"
      style={{
        background: 'var(--bg-secondary)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
