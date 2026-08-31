import { NextRequest, NextResponse } from 'next/server';
import { eq, and, ne, or, isNotNull } from 'drizzle-orm';
import { hinweise } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';
import { RUECKMELDUNG_ERINNERUNG_TAGE } from '@/lib/fristen';

const TAG_MS = 24 * 60 * 60 * 1000;

interface FristEintrag {
  hinweisId: number;
  aktenzeichen: string;
  status: string;
  faelligAm: Date;
  tageRest: number;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const jetzt = new Date();

    // Defense in Depth zusätzlich zur RLS-Policy
    const scopeCond = scope === 'all' ? undefined : eq(hinweise.kundeId, scope);

    const rows = await withTenant(scope, (tx) =>
      tx
        .select({
          id: hinweise.id,
          aktenzeichen: hinweise.aktenzeichen,
          status: hinweise.status,
          eingangsbestaetigungAm: hinweise.eingangsbestaetigungAm,
          eingangsbestaetigungFaelligAm: hinweise.eingangsbestaetigungFaelligAm,
          rueckmeldungAm: hinweise.rueckmeldungAm,
          rueckmeldungFaelligAm: hinweise.rueckmeldungFaelligAm,
        })
        .from(hinweise)
        .where(
          and(
            ne(hinweise.status, 'Abgeschlossen'),
            or(
              isNotNull(hinweise.eingangsbestaetigungFaelligAm),
              isNotNull(hinweise.rueckmeldungFaelligAm),
            ),
            scopeCond,
          ),
        ),
    );

    const eintrag = (
      row: (typeof rows)[number],
      faelligAm: Date,
    ): FristEintrag => ({
      hinweisId: row.id,
      aktenzeichen: row.aktenzeichen,
      status: row.status,
      faelligAm,
      tageRest: Math.ceil((faelligAm.getTime() - jetzt.getTime()) / TAG_MS),
    });

    const eingangsbestaetigungOffen: FristEintrag[] = [];
    const rueckmeldungUeberfaellig: FristEintrag[] = [];
    const rueckmeldungBaldFaellig: FristEintrag[] = [];

    const erinnerungBis = new Date(
      jetzt.getTime() + RUECKMELDUNG_ERINNERUNG_TAGE * TAG_MS,
    );

    for (const row of rows) {
      // Eingangsbestätigung noch nicht versendet (§ 17 Abs. 1 HinSchG)
      if (row.eingangsbestaetigungAm === null && row.eingangsbestaetigungFaelligAm !== null) {
        eingangsbestaetigungOffen.push(eintrag(row, row.eingangsbestaetigungFaelligAm));
      }

      // Rückmeldung noch offen (§ 17 Abs. 2 HinSchG)
      if (row.rueckmeldungAm === null && row.rueckmeldungFaelligAm !== null) {
        if (row.rueckmeldungFaelligAm < jetzt) {
          rueckmeldungUeberfaellig.push(eintrag(row, row.rueckmeldungFaelligAm));
        } else if (row.rueckmeldungFaelligAm <= erinnerungBis) {
          rueckmeldungBaldFaellig.push(eintrag(row, row.rueckmeldungFaelligAm));
        }
      }
    }

    const nachFaelligkeit = (a: FristEintrag, b: FristEintrag) =>
      a.faelligAm.getTime() - b.faelligAm.getTime();
    eingangsbestaetigungOffen.sort(nachFaelligkeit);
    rueckmeldungUeberfaellig.sort(nachFaelligkeit);
    rueckmeldungBaldFaellig.sort(nachFaelligkeit);

    return NextResponse.json({
      eingangsbestaetigungOffen,
      rueckmeldungUeberfaellig,
      rueckmeldungBaldFaellig,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/dashboard/fristen error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
