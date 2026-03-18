import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aufgaben, hinweise, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

const entscheidungSchema = z.object({
  relevant: z.boolean(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const data = entscheidungSchema.parse(body);

    const [aufgabe] = await db
      .select()
      .from(aufgaben)
      .where(eq(aufgaben.id, Number(id)))
      .limit(1);

    if (!aufgabe) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    if (data.relevant) {
      await db
        .update(aufgaben)
        .set({
          schritt: aufgabe.schritt + 1,
          schrittName: 'Sachverhaltsermittlung',
          status: 'InBearbeitung',
          startDatum: new Date(),
        })
        .where(eq(aufgaben.id, aufgabe.id));

      await db
        .update(hinweise)
        .set({ status: 'InBearbeitung' })
        .where(eq(hinweise.id, aufgabe.hinweisId));

      await db.insert(archiv).values({
        hinweisId: aufgabe.hinweisId,
        art: 'Log',
        ersteller: session.username,
        meldung: 'Meldung als relevant eingestuft. Sachverhaltsermittlung eingeleitet.',
      });
    } else {
      await db
        .update(aufgaben)
        .set({
          status: 'Abgeschlossen',
          erledigtAm: new Date(),
        })
        .where(eq(aufgaben.id, aufgabe.id));

      await db
        .update(hinweise)
        .set({ status: 'Abgeschlossen' })
        .where(eq(hinweise.id, aufgabe.hinweisId));

      await db.insert(archiv).values({
        hinweisId: aufgabe.hinweisId,
        art: 'Log',
        ersteller: session.username,
        meldung: 'Meldung als nicht relevant eingestuft. Vorgang abgeschlossen.',
      });
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
