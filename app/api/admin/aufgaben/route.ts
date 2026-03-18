import { NextRequest, NextResponse } from 'next/server';
import { eq, isNull, sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { aufgaben, hinweise, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'offen';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    let where;
    switch (tab) {
      case 'meine':
        where = eq(aufgaben.bearbeiterId, session.userId);
        break;
      case 'nicht-zugewiesen':
        where = isNull(aufgaben.bearbeiterId);
        break;
      case 'abgeschlossen':
        where = eq(aufgaben.status, 'Abgeschlossen');
        break;
      default:
        where = eq(aufgaben.status, 'Offen');
    }

    const rows = await db
      .select({
        id: aufgaben.id,
        titel: aufgaben.titel,
        beschreibung: aufgaben.beschreibung,
        status: aufgaben.status,
        schritt: aufgaben.schritt,
        schrittName: aufgaben.schrittName,
        faelligBis: aufgaben.faelligBis,
        hinweisId: aufgaben.hinweisId,
        aktenzeichen: hinweise.aktenzeichen,
        bearbeiterId: aufgaben.bearbeiterId,
        bearbeiterName: users.displayName,
        createdAt: aufgaben.createdAt,
      })
      .from(aufgaben)
      .leftJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
      .leftJoin(users, eq(aufgaben.bearbeiterId, users.id))
      .where(where)
      .orderBy(desc(aufgaben.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aufgaben)
      .where(where);

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/aufgaben error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
