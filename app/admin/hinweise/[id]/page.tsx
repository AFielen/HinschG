'use client';

import { use } from 'react';
import HinweisForm from '@/components/admin/HinweisForm';

export default function HinweisEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hinweisId = Number(id);

  // TODO: fetch real data from API
  const demoData = {
    istAnonym: false,
    kundeId: '1',
    meldeweg: 'Hinweisgebersystem',
    aktenzeichen: '2026-03-15-AB12CD34',
    status: 'Neu',
    hinweisgeberAnrede: 'Herr',
    hinweisgeberVorname: 'Max',
    hinweisgeberNachname: 'Mustermann',
    hinweisgeberTelefon: '+49 241 12345',
    hinweisgeberEmail: 'max@example.com',
    hinweisgeberAnmerkungen: '',
    meldungstext: 'Beispiel-Meldungstext für die Demo-Ansicht.',
    beteiligte: '',
    kategorie: 'Datenschutzverstöße',
    datumVerstoss: '2026-03-10',
  };

  return <HinweisForm mode="edit" hinweisId={hinweisId} initialData={demoData} />;
}
