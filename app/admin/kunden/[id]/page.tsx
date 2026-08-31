'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import KundeForm, { type KundeFormData, type MitarbeiterRow } from '@/components/admin/KundeForm';

// ── Types ──────────────────────────────────────────────────────────────────

interface KundeApiResponse {
  id: number;
  firma: string;
  strasse: string;
  plz: string;
  ort: string;
  telefon: string;
  telefax: string | null;
  firmenEmail: string;
  logoUrl: string | null;
  kundengruppeId: number | null;
  kundenKuerzel: string | null;
  aboModell: string | null;
  meldestelleEmail: string;
  ansprechpartner: string | null;
  meldestelleStrasse: string | null;
  meldestellePlz: string | null;
  meldestelleOrt: string | null;
  meldestelleInternetseite: string | null;
  meldestelleEmailPublic: string | null;
  meldestelleTelefonPublic: string | null;
  linkImpressum: string | null;
  linkDatenschutz: string | null;
  mitarbeiter: MitarbeiterRow[];
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function KundeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const kundeId = Number(id);

  const [initialData, setInitialData] = useState<Partial<KundeFormData> | null>(null);
  const [initialMitarbeiter, setInitialMitarbeiter] = useState<MitarbeiterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fehler, setFehler] = useState<string | null>(null);

  useEffect(() => {
    let aktiv = true;
    (async () => {
      setLoading(true);
      setFehler(null);
      try {
        const res = await fetch(`/api/admin/kunden/${kundeId}`);
        if (!aktiv) return;
        if (res.status === 404) {
          setFehler('Kunde nicht gefunden.');
          return;
        }
        if (res.status === 403) {
          setFehler('Keine Berechtigung für diesen Kunden.');
          return;
        }
        if (!res.ok) {
          setFehler('Der Kunde konnte nicht geladen werden.');
          return;
        }
        const kunde: KundeApiResponse = await res.json();
        if (!aktiv) return;
        setInitialData({
          firma: kunde.firma ?? '',
          strasse: kunde.strasse ?? '',
          plz: kunde.plz ?? '',
          ort: kunde.ort ?? '',
          telefon: kunde.telefon ?? '',
          telefax: kunde.telefax ?? '',
          firmenEmail: kunde.firmenEmail ?? '',
          logoUrl: kunde.logoUrl ?? '',
          kundengruppeId: kunde.kundengruppeId != null ? String(kunde.kundengruppeId) : '',
          kundenKuerzel: kunde.kundenKuerzel ?? '',
          aboModell: kunde.aboModell ?? '',
          ansprechpartner: kunde.ansprechpartner ?? '',
          meldestelleEmail: kunde.meldestelleEmail ?? '',
          meldestelleStrasse: kunde.meldestelleStrasse ?? '',
          meldestellePlz: kunde.meldestellePlz ?? '',
          meldestelleOrt: kunde.meldestelleOrt ?? '',
          meldestelleInternetseite: kunde.meldestelleInternetseite ?? '',
          meldestelleEmailPublic: kunde.meldestelleEmailPublic ?? '',
          meldestelleTelefonPublic: kunde.meldestelleTelefonPublic ?? '',
          linkImpressum: kunde.linkImpressum ?? '',
          linkDatenschutz: kunde.linkDatenschutz ?? '',
        });
        setInitialMitarbeiter(Array.isArray(kunde.mitarbeiter) ? kunde.mitarbeiter : []);
      } catch {
        if (aktiv) setFehler('Der Kunde konnte nicht geladen werden.');
      } finally {
        if (aktiv) setLoading(false);
      }
    })();
    return () => {
      aktiv = false;
    };
  }, [kundeId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 rounded"
            style={{ background: 'var(--bg-secondary)', animation: 'pulse 1.5s ease-in-out infinite', opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (fehler || !initialData) {
    return (
      <div className="drk-card space-y-3">
        <p className="text-sm" style={{ color: 'var(--drk-dark)' }}>
          {fehler ?? 'Der Kunde konnte nicht geladen werden.'}
        </p>
        <Link
          href="/admin/kunden"
          className="inline-flex items-center gap-1.5 text-sm font-medium"
          style={{ color: 'var(--admin-accent)' }}
        >
          Zurück zur Kundenübersicht
        </Link>
      </div>
    );
  }

  return (
    <KundeForm
      mode="edit"
      kundeId={kundeId}
      initialData={initialData}
      initialMitarbeiter={initialMitarbeiter}
    />
  );
}
