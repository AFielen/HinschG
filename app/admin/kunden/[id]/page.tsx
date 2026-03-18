'use client';

import { use } from 'react';
import KundeForm from '@/components/admin/KundeForm';

export default function KundeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const kundeId = Number(id);

  // TODO: fetch real data from API
  const demoData = {
    kundenName: 'DRK Kreisverband StädteRegion Aachen e.V.',
    kundenGruppe: 'Kreisverband',
    strasse: 'Henry-Dunant-Platz',
    hausnummer: '1',
    plz: '52146',
    ort: 'Würselen',
    telefon: '+49 2405 607-0',
    email: 'info@drk-aachen.de',
    webseite: 'https://www.drk-aachen.de',
    ansprechpartner: 'Max Mustermann',
    vertragsBeginn: '2025-01-01',
    vertragsEnde: '2027-12-31',
    vertragsNotizen: '',
    meldestelleName: 'Compliance-Abteilung',
    meldestelleEmail: 'meldestelle@drk-aachen.de',
    meldestelleTelefon: '+49 2405 607-100',
    meldestelleUrl: 'https://hinweisgebersystem.drk-aachen.de/meldestelle',
  };

  return <KundeForm mode="edit" kundeId={kundeId} initialData={demoData} />;
}
