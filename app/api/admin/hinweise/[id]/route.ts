import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { hinweise, aufgaben, archiv, kunden } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const hinweisId = Number(id);

    const [hinweis] = await db
      .select({
        id: hinweise.id,
        aktenzeichen: hinweise.aktenzeichen,
        status: hinweise.status,
        istAnonym: hinweise.istAnonym,
        kundeId: hinweise.kundeId,
        kundeName: kunden.firma,
        meldeweg: hinweise.meldeweg,
        kategorie: hinweise.kategorie,
        datumVerstoss: hinweise.datumVerstoss,
        beteiligte: hinweise.beteiligte,
        meldungstext: hinweise.meldungstext,
        hinweisgeberAnrede: hinweise.hinweisgeberAnrede,
        hinweisgeberVorname: hinweise.hinweisgeberVorname,
        hinweisgeberNachname: hinweise.hinweisgeberNachname,
        hinweisgeberTelefon: hinweise.hinweisgeberTelefon,
        hinweisgeberEmail: hinweise.hinweisgeberEmail,
        hinweisgeberAnmerkungen: hinweise.hinweisgeberAnmerkungen,
        createdAt: hinweise.createdAt,
        updatedAt: hinweise.updatedAt,
      })
      .from(hinweise)
      .leftJoin(kunden, eq(hinweise.kundeId, kunden.id))
      .where(eq(hinweise.id, hinweisId))
      .limit(1);

    if (!hinweis) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    const aufgabenRows = await db
      .select()
      .from(aufgaben)
      .where(eq(aufgaben.hinweisId, hinweisId));

    const archivRows = await db
      .select()
      .from(archiv)
      .where(eq(archiv.hinweisId, hinweisId));

    return NextResponse.json({ ...hinweis, aufgaben: aufgabenRows, archiv: archivRows });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/hinweise/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['Neu', 'InBearbeitung', 'Abgeschlossen']).optional(),
  istAnonym: z.boolean().optional(),
  kundeId: z.number({ coerce: true }).optional(),
  meldeweg: z.enum(['Hinweisgebersystem', 'Telefon', 'Email', 'Post']).optional(),
  kategorie: z.string().optional(),
  datumVerstoss: z.string().optional(),
  beteiligte: z.string().optional(),
  meldungstext: z.string().optional(),
  hinweisgeberAnrede: z.enum(['Frau', 'Herr']).optional(),
  hinweisgeberVorname: z.string().optional(),
  hinweisgeberNachname: z.string().optional(),
  hinweisgeberTelefon: z.string().optional(),
  hinweisgeberEmail: z.string().optional(),
  hinweisgeberAnmerkungen: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;
    const hinweisId = Number(id);
    const body = await request.json();
    const data = updateSchema.parse(body);

    const [existing] = await db
      .select({ id: hinweise.id })
      .from(hinweise)
      .where(eq(hinweise.id, hinweisId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    const [updated] = await db
      .update(hinweise)
      .set(data)
      .where(eq(hinweise.id, hinweisId))
      .returning();

    await db.insert(archiv).values({
      hinweisId,
      art: 'Log',
      ersteller: session.username,
      meldung: `Hinweis aktualisiert von ${session.username}`,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/hinweise/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const hinweisId = Number(id);

    const [existing] = await db
      .select({ id: hinweise.id })
      .from(hinweise)
      .where(eq(hinweise.id, hinweisId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    await db.delete(archiv).where(eq(archiv.hinweisId, hinweisId));
    await db.delete(aufgaben).where(eq(aufgaben.hinweisId, hinweisId));
    await db.delete(hinweise).where(eq(hinweise.id, hinweisId));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('DELETE /api/admin/hinweise/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
