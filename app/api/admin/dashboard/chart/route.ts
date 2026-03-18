import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { hinweise } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await db
      .select({
        date: sql<string>`to_char(${hinweise.updatedAt}::date, 'YYYY-MM-DD')`,
        count: sql<number>`count(*)::int`,
      })
      .from(hinweise)
      .where(
        sql`${hinweise.status} = 'Abgeschlossen' AND ${hinweise.updatedAt} >= ${since}`,
      )
      .groupBy(sql`${hinweise.updatedAt}::date`)
      .orderBy(sql`${hinweise.updatedAt}::date`);

    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/dashboard/chart error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
