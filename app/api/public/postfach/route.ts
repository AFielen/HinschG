import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { hinweise, nachrichten, anhaenge } from '@/lib/db/schema';
import { withTenant } from '@/lib/db/tenant';
import { requirePostfach } from '@/lib/auth/middleware';

/**
 * Postfach-Übersicht für den Hinweisgeber.
 *
 * Gibt bewusst NUR Status- und Fristfelder sowie den Nachrichten-Thread
 * zurück — keine internen Felder, keine personenbezogenen Daten.
 */
export async function GET(request: NextRequest) {
  try {
    const { hinweisId } = await requirePostfach(request);

    const result = await withTenant('all', async (tx) => {
      const [hinweis] = await tx
        .select({
          aktenzeichen: hinweise.aktenzeichen,
          status: hinweise.status,
          createdAt: hinweise.createdAt,
          eingangsbestaetigungAm: hinweise.eingangsbestaetigungAm,
          rueckmeldungFaelligAm: hinweise.rueckmeldungFaelligAm,
          rueckmeldungAm: hinweise.rueckmeldungAm,
        })
        .from(hinweise)
        .where(eq(hinweise.id, hinweisId))
        .limit(1);

      if (!hinweis) return null;

      // Nachrichten der Meldestelle beim Abruf als gelesen markieren
      await tx
        .update(nachrichten)
        .set({ gelesenAm: new Date() })
        .where(
          and(
            eq(nachrichten.hinweisId, hinweisId),
            eq(nachrichten.richtung, 'AnHinweisgeber'),
            isNull(nachrichten.gelesenAm),
          ),
        );

      const thread = await tx
        .select({
          id: nachrichten.id,
          richtung: nachrichten.richtung,
          inhalt: nachrichten.inhalt,
          createdAt: nachrichten.createdAt,
        })
        .from(nachrichten)
        .where(eq(nachrichten.hinweisId, hinweisId))
        .orderBy(asc(nachrichten.createdAt), asc(nachrichten.id));

      const anhangListe = await tx
        .select({
          id: anhaenge.id,
          dateiname: anhaenge.dateiname,
          groesse: anhaenge.groesse,
          createdAt: anhaenge.createdAt,
        })
        .from(anhaenge)
        .where(eq(anhaenge.hinweisId, hinweisId))
        .orderBy(asc(anhaenge.createdAt), asc(anhaenge.id));

      return { ...hinweis, nachrichten: thread, anhaenge: anhangListe };
    });

    if (!result) {
      return NextResponse.json(
        { error: 'Meldung wurde nicht gefunden.' },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/public/postfach error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
