import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { kunden, kundengruppen, mitarbeiter } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [kunde] = await db
      .select({
        id: kunden.id,
        firma: kunden.firma,
        strasse: kunden.strasse,
        plz: kunden.plz,
        ort: kunden.ort,
        telefon: kunden.telefon,
        telefax: kunden.telefax,
        firmenEmail: kunden.firmenEmail,
        logoName: kunden.logoName,
        logoUrl: kunden.logoUrl,
        kundengruppeId: kunden.kundengruppeId,
        kundengruppeName: kundengruppen.name,
        kundenKuerzel: kunden.kundenKuerzel,
        aboModell: kunden.aboModell,
        meldestelleEmail: kunden.meldestelleEmail,
        ansprechpartner: kunden.ansprechpartner,
        meldestelleStrasse: kunden.meldestelleStrasse,
        meldestellePlz: kunden.meldestellePlz,
        meldestelleOrt: kunden.meldestelleOrt,
        meldestelleInternetseite: kunden.meldestelleInternetseite,
        meldestelleEmailPublic: kunden.meldestelleEmailPublic,
        meldestelleTelefonPublic: kunden.meldestelleTelefonPublic,
        linkImpressum: kunden.linkImpressum,
        linkDatenschutz: kunden.linkDatenschutz,
        createdAt: kunden.createdAt,
        updatedAt: kunden.updatedAt,
      })
      .from(kunden)
      .leftJoin(kundengruppen, eq(kunden.kundengruppeId, kundengruppen.id))
      .where(eq(kunden.id, Number(id)))
      .limit(1);

    if (!kunde) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    const mitarbeiterRows = await db
      .select()
      .from(mitarbeiter)
      .where(eq(mitarbeiter.kundeId, Number(id)));

    return NextResponse.json({ ...kunde, mitarbeiter: mitarbeiterRows });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/kunden/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  firma: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  telefon: z.string().optional(),
  telefax: z.string().optional(),
  firmenEmail: z.string().email().optional(),
  logoName: z.string().optional(),
  logoUrl: z.string().optional(),
  kundengruppeId: z.number({ coerce: true }).nullable().optional(),
  kundenKuerzel: z.string().optional(),
  aboModell: z.string().optional(),
  meldestelleEmail: z.string().email().optional(),
  ansprechpartner: z.string().optional(),
  meldestelleStrasse: z.string().optional(),
  meldestellePlz: z.string().optional(),
  meldestelleOrt: z.string().optional(),
  meldestelleInternetseite: z.string().optional(),
  meldestelleEmailPublic: z.string().optional(),
  meldestelleTelefonPublic: z.string().optional(),
  linkImpressum: z.string().optional(),
  linkDatenschutz: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const [updated] = await db
      .update(kunden)
      .set(data)
      .where(eq(kunden.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/kunden/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const kundeId = Number(id);

    const [existing] = await db
      .select({ id: kunden.id })
      .from(kunden)
      .where(eq(kunden.id, kundeId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    await db.delete(mitarbeiter).where(eq(mitarbeiter.kundeId, kundeId));
    await db.delete(kunden).where(eq(kunden.id, kundeId));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('DELETE /api/admin/kunden/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
