import { NextRequest, NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { aufgaben, hinweise } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const url = new URL(request.url);
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get('days')) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Defense in Depth zusätzlich zur RLS-Policy
    const scopeCond = scope === 'all' ? undefined : eq(hinweise.kundeId, scope);

    // Erledigte Aufgaben pro Tag auf Basis von erledigt_am (nicht updated_at)
    const rows = await withTenant(scope, (tx) =>
      tx
        .select({
          date: sql<string>`to_char(${aufgaben.erledigtAm}::date, 'YYYY-MM-DD')`,
          count: sql<number>`count(*)::int`,
        })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(
          and(
            sql`${aufgaben.status} = 'Abgeschlossen' AND ${aufgaben.erledigtAm} IS NOT NULL AND ${aufgaben.erledigtAm} >= ${since}`,
            scopeCond,
          ),
        )
        .groupBy(sql`${aufgaben.erledigtAm}::date`)
        .orderBy(sql`${aufgaben.erledigtAm}::date`),
    );

    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/dashboard/chart error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
