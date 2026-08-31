import { NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { kunden } from '@/lib/db/schema';

/**
 * Öffentliche Organisationsliste für die Meldestellen-Wizards.
 *
 * Gibt bewusst NUR id und firma zurück — keine Adress- oder Kontaktdaten.
 * (Die Tabelle kunden hat kein Aktiv-Flag; es werden alle Kunden geliefert.)
 */
export async function GET() {
  try {
    const rows = await db
      .select({ id: kunden.id, firma: kunden.firma })
      .from(kunden)
      .orderBy(asc(kunden.firma));

    return NextResponse.json(rows, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('GET /api/public/kunden error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
