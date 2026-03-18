import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, ilike, or, sql, desc, asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { hinweise, kunden, aufgaben, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

function generateAktenzeichen(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${y}-${m}-${d}-${rand}`;
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sort') || 'createdAt';
    const sortOrder = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (status && ['Neu', 'InBearbeitung', 'Abgeschlossen'].includes(status)) {
      conditions.push(eq(hinweise.status, status as 'Neu' | 'InBearbeitung' | 'Abgeschlossen'));
    }
    if (search) {
      conditions.push(
        or(
          ilike(hinweise.aktenzeichen, `%${search}%`),
          ilike(hinweise.meldungstext, `%${search}%`),
          ilike(hinweise.hinweisgeberNachname, `%${search}%`),
        )!,
      );
    }

    const where = conditions.length > 0
      ? sql`${conditions.reduce((acc, cond, i) => (i === 0 ? cond : sql`${acc} AND ${cond}`))}`
      : undefined;

    const sortCol = sortBy === 'aktenzeichen' ? hinweise.aktenzeichen
      : sortBy === 'status' ? hinweise.status
      : hinweise.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const rows = await db
      .select({
        id: hinweise.id,
        aktenzeichen: hinweise.aktenzeichen,
        status: hinweise.status,
        istAnonym: hinweise.istAnonym,
        kundeId: hinweise.kundeId,
        kundeName: kunden.firma,
        meldeweg: hinweise.meldeweg,
        kategorie: hinweise.kategorie,
        meldungstext: hinweise.meldungstext,
        hinweisgeberVorname: hinweise.hinweisgeberVorname,
        hinweisgeberNachname: hinweise.hinweisgeberNachname,
        createdAt: hinweise.createdAt,
        updatedAt: hinweise.updatedAt,
      })
      .from(hinweise)
      .leftJoin(kunden, eq(hinweise.kundeId, kunden.id))
      .where(where)
      .orderBy(orderFn(sortCol))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(hinweise)
      .where(where);

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/hinweise error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  istAnonym: z.boolean().default(false),
  kundeId: z.number({ coerce: true }),
  meldeweg: z.enum(['Hinweisgebersystem', 'Telefon', 'Email', 'Post']).optional(),
  kategorie: z.string().optional(),
  datumVerstoss: z.string().optional(),
  beteiligte: z.string().optional(),
  meldungstext: z.string().min(1),
  hinweisgeberAnrede: z.enum(['Frau', 'Herr']).optional(),
  hinweisgeberVorname: z.string().optional(),
  hinweisgeberNachname: z.string().optional(),
  hinweisgeberTelefon: z.string().optional(),
  hinweisgeberEmail: z.string().optional(),
  hinweisgeberAnmerkungen: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);
    const aktenzeichen = generateAktenzeichen();

    const [hinweis] = await db
      .insert(hinweise)
      .values({
        aktenzeichen,
        status: 'Neu',
        istAnonym: data.istAnonym,
        kundeId: data.kundeId,
        meldeweg: data.meldeweg ?? 'Hinweisgebersystem',
        kategorie: data.kategorie ?? null,
        datumVerstoss: data.datumVerstoss ?? null,
        beteiligte: data.beteiligte ?? null,
        meldungstext: data.meldungstext,
        hinweisgeberAnrede: data.istAnonym ? null : (data.hinweisgeberAnrede ?? null),
        hinweisgeberVorname: data.istAnonym ? null : (data.hinweisgeberVorname ?? null),
        hinweisgeberNachname: data.istAnonym ? null : (data.hinweisgeberNachname ?? null),
        hinweisgeberTelefon: data.istAnonym ? null : (data.hinweisgeberTelefon ?? null),
        hinweisgeberEmail: data.istAnonym ? null : (data.hinweisgeberEmail ?? null),
        hinweisgeberAnmerkungen: data.istAnonym ? null : (data.hinweisgeberAnmerkungen ?? null),
      })
      .returning();

    await db.insert(aufgaben).values({
      hinweisId: hinweis.id,
      titel: 'Neue Meldung prüfen',
      beschreibung: `Eingegangene Meldung (${aktenzeichen}) sichten und Relevanz prüfen.`,
      status: 'Offen',
      schritt: 1,
      schrittName: 'Eingangsbestätigung',
    });

    await db.insert(archiv).values({
      hinweisId: hinweis.id,
      art: 'Log',
      ersteller: session.username,
      meldung: `Meldung manuell erstellt von ${session.username}. Aktenzeichen: ${aktenzeichen}`,
    });

    return NextResponse.json({ success: true, data: hinweis }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/hinweise error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
