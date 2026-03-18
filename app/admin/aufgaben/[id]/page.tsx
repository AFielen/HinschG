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
  hinweisId: number | null;
  hinweisAktenzeichen: string | null;
  schrittName: string | null;
  faelligBis: string | null;
  erstelltAm: string;
  bearbeiterName: string | null;
  status: string;
  kommentar: string | null;
}

interface WorkflowSchritt {
  id: number;
  name: string;
  status: string;
  faelligBis: string | null;
  bearbeiterName: string | null;
}

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

// ── Component ──────────────────────────────────────────────────────────────

export default function AufgabeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [aufgabe, setAufgabe] = useState<AufgabeDetail | null>(null);
  const [schritte, setSchritte] = useState<WorkflowSchritt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aufgabeRes, schritteRes] = await Promise.allSettled([
        fetch(`/api/admin/aufgaben/${id}`),
        fetch(`/api/admin/aufgaben/${id}/workflow`),
      ]);

      if (aufgabeRes.status === 'fulfilled' && aufgabeRes.value.ok) {
        setAufgabe(await aufgabeRes.value.json());
      }
      if (schritteRes.status === 'fulfilled' && schritteRes.value.ok) {
        setSchritte(await schritteRes.value.json());
      }
    } catch {
      // API not yet available
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
            {aufgabe?.hinweisAktenzeichen && (
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
                  {aufgabe.hinweisAktenzeichen}
                </Link>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 self-start">
          {aufgabe && <StatusBadge status={aufgabe.status} />}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Case details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Aufgabe Details */}
          <CollapsibleSection title="Aufgaben-Details" defaultOpen>
            <div className="space-y-4">
              <DetailRow label="Titel" value={aufgabe?.titel} />
              <DetailRow label="Status" value={aufgabe?.status}>
                {aufgabe && <StatusBadge status={aufgabe.status} />}
              </DetailRow>
              <DetailRow label="Schritt" value={aufgabe?.schrittName} />
              <DetailRow
                label="Fällig bis"
                value={
                  aufgabe?.faelligBis
                    ? formatDate(aufgabe.faelligBis)
                    : undefined
                }
              />
              <DetailRow
                label="Erstellt am"
                value={
                  aufgabe?.erstelltAm
                    ? formatDateTime(aufgabe.erstelltAm)
                    : undefined
                }
              />
              <DetailRow
                label="Bearbeiter"
                value={aufgabe?.bearbeiterName}
              />
            </div>
          </CollapsibleSection>

          {/* Beschreibung */}
          <CollapsibleSection title="Beschreibung" defaultOpen>
            <div
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-light)' }}
            >
              {aufgabe?.beschreibung ?? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Keine Beschreibung vorhanden.
                </span>
              )}
            </div>
          </CollapsibleSection>

          {/* Kommentar */}
          <CollapsibleSection title="Kommentar" defaultOpen={false}>
            <div
              className="text-sm leading-relaxed"
              style={{ color: 'var(--text-light)' }}
            >
              {aufgabe?.kommentar ?? (
                <span style={{ color: 'var(--text-muted)' }}>
                  Kein Kommentar vorhanden.
                </span>
              )}
            </div>
          </CollapsibleSection>
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
              {schritte.length === 0 ? (
                <div
                  className="px-4 py-6 text-sm text-center"
                  style={{ color: 'var(--text-muted)' }}
                >
                  Keine Workflow-Schritte vorhanden.
                </div>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {schritte.map((s, idx) => (
                    <WorkflowStep
                      key={s.id}
                      schritt={s}
                      index={idx}
                      isActive={s.name === aufgabe?.schrittName}
                    />
                  ))}
                </div>
              )}
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
              <ActionButton
                label="Abschließen"
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
            </div>
          </div>

          {/* Hinweis Link */}
          {aufgabe?.hinweisId && (
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
                  {aufgabe.hinweisAktenzeichen ?? `Hinweis #${aufgabe.hinweisId}`}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
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
  schritt,
  index,
  isActive,
}: {
  schritt: WorkflowSchritt;
  index: number;
  isActive: boolean;
}) {
  const isComplete = schritt.status === 'Abgeschlossen';

  return (
    <div
      className="flex items-start gap-3 px-4 py-3"
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
          index + 1
        )}
      </div>

      {/* Step info */}
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-medium"
          style={{ color: isActive ? '#3d5a80' : 'var(--text)' }}
        >
          {schritt.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={schritt.status} />
          {schritt.faelligBis && (
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              bis {formatDate(schritt.faelligBis)}
            </span>
          )}
        </div>
      </div>
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
