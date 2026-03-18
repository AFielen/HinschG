import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, ilike, or, sql, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { kunden, kundengruppen } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sort') || 'firma';
    const sortOrder = url.searchParams.get('order') === 'desc' ? 'desc' : 'asc';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const where = search
      ? or(
          ilike(kunden.firma, `%${search}%`),
          ilike(kunden.ort, `%${search}%`),
          ilike(kunden.firmenEmail, `%${search}%`),
        )
      : undefined;

    const sortCol = sortBy === 'ort' ? kunden.ort
      : sortBy === 'plz' ? kunden.plz
      : sortBy === 'email' ? kunden.firmenEmail
      : kunden.firma;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const rows = await db
      .select({
        id: kunden.id,
        firma: kunden.firma,
        strasse: kunden.strasse,
        plz: kunden.plz,
        ort: kunden.ort,
        telefon: kunden.telefon,
        firmenEmail: kunden.firmenEmail,
        kundengruppeId: kunden.kundengruppeId,
        kundengruppeName: kundengruppen.name,
        createdAt: kunden.createdAt,
      })
      .from(kunden)
      .leftJoin(kundengruppen, eq(kunden.kundengruppeId, kundengruppen.id))
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(kunden)
      .where(where);

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/kunden error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  firma: z.string().min(1, 'Firmenname ist erforderlich'),
  strasse: z.string().min(1),
  plz: z.string().min(1),
  ort: z.string().min(1),
  telefon: z.string().min(1),
  telefax: z.string().optional(),
  firmenEmail: z.string().email(),
  logoName: z.string().optional(),
  logoUrl: z.string().optional(),
  kundengruppeId: z.number({ coerce: true }).optional(),
  kundenKuerzel: z.string().optional(),
  aboModell: z.string().optional(),
  meldestelleEmail: z.string().email(),
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

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const [kunde] = await db
      .insert(kunden)
      .values(data)
      .returning();

    return NextResponse.json({ success: true, data: kunde }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/kunden error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
