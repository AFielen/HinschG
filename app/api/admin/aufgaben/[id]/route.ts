import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aufgaben, hinweise, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [aufgabe] = await db
      .select({
        id: aufgaben.id,
        titel: aufgaben.titel,
        beschreibung: aufgaben.beschreibung,
        status: aufgaben.status,
        schritt: aufgaben.schritt,
        schrittName: aufgaben.schrittName,
        faelligBis: aufgaben.faelligBis,
        startDatum: aufgaben.startDatum,
        erledigtAm: aufgaben.erledigtAm,
        hinweisId: aufgaben.hinweisId,
        aktenzeichen: hinweise.aktenzeichen,
        bearbeiterId: aufgaben.bearbeiterId,
        bearbeiterName: users.displayName,
        createdAt: aufgaben.createdAt,
        updatedAt: aufgaben.updatedAt,
      })
      .from(aufgaben)
      .leftJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
      .leftJoin(users, eq(aufgaben.bearbeiterId, users.id))
      .where(eq(aufgaben.id, Number(id)))
      .limit(1);

    if (!aufgabe) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(aufgabe);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/aufgaben/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['Offen', 'InBearbeitung', 'Abgeschlossen']).optional(),
  bearbeiterId: z.number({ coerce: true }).nullable().optional(),
  titel: z.string().optional(),
  beschreibung: z.string().optional(),
  faelligBis: z.string().nullable().optional(),
  schritt: z.number().optional(),
  schrittName: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.status === 'InBearbeitung' && !data.faelligBis) {
      updateData.startDatum = new Date();
    }
    if (data.status === 'Abgeschlossen') {
      updateData.erledigtAm = new Date();
    }
    if (data.faelligBis !== undefined) {
      updateData.faelligBis = data.faelligBis ? new Date(data.faelligBis) : null;
    }

    const [updated] = await db
      .update(aufgaben)
      .set(updateData)
      .where(eq(aufgaben.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/aufgaben/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
