import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, ilike, or, sql, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { mitarbeiter, kunden } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const kundeId = url.searchParams.get('kundeId');
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (kundeId) {
      conditions.push(eq(mitarbeiter.kundeId, Number(kundeId)));
    }
    if (search) {
      conditions.push(
        or(
          ilike(mitarbeiter.vorname, `%${search}%`),
          ilike(mitarbeiter.nachname, `%${search}%`),
          ilike(mitarbeiter.email1, `%${search}%`),
          ilike(mitarbeiter.funktion, `%${search}%`),
        )!,
      );
    }

    const where = conditions.length > 0
      ? sql`${conditions.reduce((acc, cond, i) => (i === 0 ? cond : sql`${acc} AND ${cond}`))}`
      : undefined;

    const rows = await db
      .select({
        id: mitarbeiter.id,
        kundeId: mitarbeiter.kundeId,
        firma: kunden.firma,
        anrede: mitarbeiter.anrede,
        vorname: mitarbeiter.vorname,
        nachname: mitarbeiter.nachname,
        email1: mitarbeiter.email1,
        telefon: mitarbeiter.telefon,
        mobil: mitarbeiter.mobil,
        funktion: mitarbeiter.funktion,
        istMeldestelle: mitarbeiter.istMeldestelle,
        istGeschaeftsfuehrer: mitarbeiter.istGeschaeftsfuehrer,
        createdAt: mitarbeiter.createdAt,
      })
      .from(mitarbeiter)
      .leftJoin(kunden, eq(mitarbeiter.kundeId, kunden.id))
      .where(where)
      .orderBy(asc(mitarbeiter.nachname))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(mitarbeiter)
      .where(where);

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/mitarbeiter error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  kundeId: z.number({ coerce: true }),
  anrede: z.enum(['Frau', 'Herr']).optional(),
  vorname: z.string().optional(),
  nachname: z.string().optional(),
  email1: z.string().optional(),
  email2: z.string().optional(),
  telefon: z.string().optional(),
  mobil: z.string().optional(),
  anschrift: z.string().optional(),
  funktion: z.string().optional(),
  istMeldestelle: z.boolean().default(false),
  istGeschaeftsfuehrer: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const [row] = await db
      .insert(mitarbeiter)
      .values(data)
      .returning();

    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/mitarbeiter error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
