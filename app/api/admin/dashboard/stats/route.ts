import { NextRequest, NextResponse } from 'next/server';
import { eq, and, sql } from 'drizzle-orm';
import { hinweise, aufgaben } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const url = new URL(request.url);
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get('timeframe')) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Defense in Depth zusätzlich zur RLS-Policy
    const scopeCond = scope === 'all' ? undefined : eq(hinweise.kundeId, scope);

    const stats = await withTenant(scope, async (tx) => {
      const [completedResult] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(hinweise)
        .where(
          and(
            sql`${hinweise.status} = 'Abgeschlossen' AND ${hinweise.updatedAt} >= ${since}`,
            scopeCond,
          ),
        );

      const [avgResult] = await tx
        .select({
          avg: sql<number>`coalesce(avg(extract(epoch from (${aufgaben.erledigtAm} - ${aufgaben.createdAt})) / 86400)::numeric(10,1), 0)`,
        })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(
          and(
            sql`${aufgaben.status} = 'Abgeschlossen' AND ${aufgaben.erledigtAm} IS NOT NULL AND ${aufgaben.createdAt} >= ${since}`,
            scopeCond,
          ),
        );

      const [erledigteTasks] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(
          and(
            sql`${aufgaben.createdAt} >= ${since} AND ${aufgaben.status} = 'Abgeschlossen'`,
            scopeCond,
          ),
        );

      const [onTimeTasks] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(
          and(
            sql`${aufgaben.createdAt} >= ${since} AND ${aufgaben.status} = 'Abgeschlossen' AND (${aufgaben.faelligBis} IS NULL OR ${aufgaben.erledigtAm} <= ${aufgaben.faelligBis})`,
            scopeCond,
          ),
        );

      const [statusCounts] = await tx
        .select({
          neu: sql<number>`count(*) filter (where ${hinweise.status} = 'Neu')::int`,
          inBearbeitung: sql<number>`count(*) filter (where ${hinweise.status} = 'InBearbeitung')::int`,
          abgeschlossen: sql<number>`count(*) filter (where ${hinweise.status} = 'Abgeschlossen')::int`,
        })
        .from(hinweise)
        .where(scopeCond);

      return { completedResult, avgResult, erledigteTasks, onTimeTasks, statusCounts };
    });

    // Fristgerecht erledigte / erledigte Aufgaben (nicht / alle Aufgaben)
    const onTimePercentage =
      stats.erledigteTasks.count > 0
        ? Math.round((stats.onTimeTasks.count / stats.erledigteTasks.count) * 100)
        : 100;

    return NextResponse.json({
      completedCount: stats.completedResult.count,
      avgProcessingDays: Number(stats.avgResult.avg),
      onTimePercentage,
      statusCounts: {
        Neu: stats.statusCounts.neu,
        InBearbeitung: stats.statusCounts.inBearbeitung,
        Abgeschlossen: stats.statusCounts.abgeschlossen,
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/dashboard/stats error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
