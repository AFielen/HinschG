import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aufgaben, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

const protokollSchema = z.object({
  meldung: z.string().min(1, 'Protokoll-Text darf nicht leer sein.'),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const data = protokollSchema.parse(body);

    const [aufgabe] = await db
      .select({ hinweisId: aufgaben.hinweisId })
      .from(aufgaben)
      .where(eq(aufgaben.id, Number(id)))
      .limit(1);

    if (!aufgabe) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    const [entry] = await db
      .insert(archiv)
      .values({
        hinweisId: aufgabe.hinweisId,
        art: 'Log',
        ersteller: session.username,
        meldung: data.meldung,
      })
      .returning();

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/aufgaben/[id]/protokoll error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
