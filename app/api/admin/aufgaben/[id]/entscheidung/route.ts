import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { aufgaben, hinweise, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';
import { berechneLoeschdatum } from '@/lib/fristen';

const entscheidungSchema = z.object({
  relevant: z.boolean(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const body = await request.json();
    const data = entscheidungSchema.parse(body);

    const gefunden = await withTenant(scope, async (tx) => {
      const where =
        scope === 'all'
          ? eq(aufgaben.id, Number(id))
          : and(eq(aufgaben.id, Number(id)), eq(hinweise.kundeId, scope));

      const [aufgabe] = await tx
        .select({
          id: aufgaben.id,
          schritt: aufgaben.schritt,
          hinweisId: aufgaben.hinweisId,
        })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(where)
        .limit(1);

      if (!aufgabe) return false;

      if (data.relevant) {
        await tx
          .update(aufgaben)
          .set({
            schritt: aufgabe.schritt + 1,
            schrittName: 'Sachverhaltsermittlung',
            status: 'InBearbeitung',
            startDatum: new Date(),
          })
          .where(eq(aufgaben.id, aufgabe.id));

        await tx
          .update(hinweise)
          .set({ status: 'InBearbeitung' })
          .where(eq(hinweise.id, aufgabe.hinweisId));

        await tx.insert(archiv).values({
          hinweisId: aufgabe.hinweisId,
          art: 'Log',
          ersteller: session.username,
          meldung: 'Meldung als relevant eingestuft. Sachverhaltsermittlung eingeleitet.',
        });
      } else {
        const jetzt = new Date();

        await tx
          .update(aufgaben)
          .set({
            status: 'Abgeschlossen',
            erledigtAm: jetzt,
          })
          .where(eq(aufgaben.id, aufgabe.id));

        // Abschluss inkl. Löschfrist (§ 11 Abs. 5 HinSchG)
        await tx
          .update(hinweise)
          .set({
            status: 'Abgeschlossen',
            abgeschlossenAm: jetzt,
            loeschenAm: berechneLoeschdatum(jetzt),
          })
          .where(eq(hinweise.id, aufgabe.hinweisId));

        await tx.insert(archiv).values({
          hinweisId: aufgabe.hinweisId,
          art: 'Log',
          ersteller: session.username,
          meldung: 'Meldung als nicht relevant eingestuft. Vorgang abgeschlossen.',
        });
      }

      return true;
    });

    if (!gefunden) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, relevant: data.relevant });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/aufgaben/[id]/entscheidung error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
