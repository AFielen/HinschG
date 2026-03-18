import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emails, emailKonten } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'eingang';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    let where;
    switch (tab) {
      case 'gesendet':
        where = eq(emails.status, 'Gesendet');
        break;
      case 'warteschlange':
        where = eq(emails.status, 'Warteschlange');
        break;
      case 'fehler':
        where = eq(emails.status, 'Fehler');
        break;
      default:
        where = eq(emails.richtung, 'Eingang');
    }

    const rows = await db
      .select({
        id: emails.id,
        kontoId: emails.kontoId,
        kontoName: emailKonten.name,
        richtung: emails.richtung,
        von: emails.von,
        an: emails.an,
        betreff: emails.betreff,
        inhalt: emails.inhalt,
        status: emails.status,
        hinweisId: emails.hinweisId,
        createdAt: emails.createdAt,
      })
      .from(emails)
      .leftJoin(emailKonten, eq(emails.kontoId, emailKonten.id))
      .where(where)
      .orderBy(desc(emails.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(emails)
      .where(where);

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/emails error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  kontoId: z.number({ coerce: true }),
  an: z.string().email('Ungültige E-Mail-Adresse'),
  betreff: z.string().min(1, 'Betreff ist erforderlich'),
  inhalt: z.string().min(1, 'Inhalt ist erforderlich'),
  hinweisId: z.number({ coerce: true }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const [konto] = await db
      .select({ email: emailKonten.email })
      .from(emailKonten)
      .where(eq(emailKonten.id, data.kontoId))
      .limit(1);

    if (!konto) {
      return NextResponse.json({ error: 'E-Mail-Konto nicht gefunden' }, { status: 404 });
    }

    const [email] = await db
      .insert(emails)
      .values({
        kontoId: data.kontoId,
        richtung: 'Ausgang',
        von: konto.email,
        an: data.an,
        betreff: data.betreff,
        inhalt: data.inhalt,
        status: 'Warteschlange',
        hinweisId: data.hinweisId ?? null,
      })
      .returning();

    return NextResponse.json({ success: true, data: email }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/emails error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
