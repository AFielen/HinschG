'use client';

import { use, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import HinweisForm, {
  type NachrichtRow,
  type ArchivRow,
  type FristenInfo,
} from '@/components/admin/HinweisForm';

// ── Types ──────────────────────────────────────────────────────────────────

interface HinweisDetail {
  id: number;
  aktenzeichen: string;
  status: string;
  istAnonym: boolean;
  kundeId: number;
  meldeweg: string | null;
  kategorie: string | null;
  datumVerstoss: string | null;
  beteiligte: string | null;
  meldungstext: string;
  hinweisgeberAnrede: string | null;
  hinweisgeberVorname: string | null;
  hinweisgeberNachname: string | null;
  hinweisgeberTelefon: string | null;
  hinweisgeberEmail: string | null;
  hinweisgeberAnmerkungen: string | null;
  eingangsbestaetigungAm: string | null;
  eingangsbestaetigungFaelligAm: string | null;
  rueckmeldungAm: string | null;
  rueckmeldungFaelligAm: string | null;
  createdAt: string;
  nachrichten: NachrichtRow[];
  archiv: ArchivRow[];
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function HinweisEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hinweisId = Number(id);

  const [hinweis, setHinweis] = useState<HinweisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/hinweise/${hinweisId}`);
      if (res.status === 404) {
        setFehler('Der Hinweis wurde nicht gefunden.');
        return;
      }
      if (!res.ok) {
        setFehler('Der Hinweis konnte nicht geladen werden.');
        return;
      }
      // Die Route liefert das Hinweis-Objekt direkt (keine data-Hülle)
      setHinweis(await res.json());
      setFehler(null);
    } catch {
      setFehler('Der Hinweis konnte nicht geladen werden.');
    } finally {
      setLoading(false);
    }
  }, [hinweisId]);

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

  if (fehler || !hinweis) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: 'var(--error-bg)', border: '1px solid var(--error-border)', color: 'var(--error-text)' }}
        >
          {fehler ?? 'Der Hinweis konnte nicht geladen werden.'}
        </div>
        <Link
          href="/admin/hinweise"
          className="inline-flex items-center px-4 py-2.5 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--admin-accent)', minHeight: '44px' }}
        >
          Zur Übersicht
        </Link>
      </div>
    );
  }

  const initialData = {
    istAnonym: hinweis.istAnonym,
    kundeId: String(hinweis.kundeId),
    meldeweg: hinweis.meldeweg ?? 'Hinweisgebersystem',
    aktenzeichen: hinweis.aktenzeichen,
    status: hinweis.status,
    hinweisgeberAnrede: hinweis.hinweisgeberAnrede ?? '',
    hinweisgeberVorname: hinweis.hinweisgeberVorname ?? '',
    hinweisgeberNachname: hinweis.hinweisgeberNachname ?? '',
    hinweisgeberTelefon: hinweis.hinweisgeberTelefon ?? '',
    hinweisgeberEmail: hinweis.hinweisgeberEmail ?? '',
    hinweisgeberAnmerkungen: hinweis.hinweisgeberAnmerkungen ?? '',
    meldungstext: hinweis.meldungstext,
    beteiligte: hinweis.beteiligte ?? '',
    kategorie: hinweis.kategorie ?? '',
    datumVerstoss: hinweis.datumVerstoss ?? '',
  };

  const fristen: FristenInfo = {
    createdAt: hinweis.createdAt,
    eingangsbestaetigungAm: hinweis.eingangsbestaetigungAm,
    eingangsbestaetigungFaelligAm: hinweis.eingangsbestaetigungFaelligAm,
    rueckmeldungAm: hinweis.rueckmeldungAm,
    rueckmeldungFaelligAm: hinweis.rueckmeldungFaelligAm,
  };

  return (
    <HinweisForm
      mode="edit"
      hinweisId={hinweisId}
      initialData={initialData}
      nachrichten={hinweis.nachrichten}
      archiv={hinweis.archiv}
      fristen={fristen}
      onReload={fetchData}
    />
  );
}
