import { NextRequest, NextResponse } from 'next/server';
import { eq, sql, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { hinweise, aufgaben } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const days = Math.min(365, Math.max(1, Number(url.searchParams.get('timeframe')) || 30));
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [completedResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(hinweise)
      .where(
        sql`${hinweise.status} = 'Abgeschlossen' AND ${hinweise.updatedAt} >= ${since}`,
      );

    const [avgResult] = await db
      .select({
        avg: sql<number>`coalesce(avg(extract(epoch from (${aufgaben.erledigtAm} - ${aufgaben.createdAt})) / 86400)::numeric(10,1), 0)`,
      })
      .from(aufgaben)
      .where(
        sql`${aufgaben.status} = 'Abgeschlossen' AND ${aufgaben.erledigtAm} IS NOT NULL AND ${aufgaben.createdAt} >= ${since}`,
      );

    const [totalTasks] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aufgaben)
      .where(gte(aufgaben.createdAt, since));

    const [onTimeTasks] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(aufgaben)
      .where(
        sql`${aufgaben.createdAt} >= ${since} AND ${aufgaben.status} = 'Abgeschlossen' AND (${aufgaben.faelligBis} IS NULL OR ${aufgaben.erledigtAm} <= ${aufgaben.faelligBis})`,
      );

    const onTimePercentage = totalTasks.count > 0
      ? Math.round((onTimeTasks.count / totalTasks.count) * 100)
      : 100;

    const [statusCounts] = await db
      .select({
        neu: sql<number>`count(*) filter (where ${hinweise.status} = 'Neu')::int`,
        inBearbeitung: sql<number>`count(*) filter (where ${hinweise.status} = 'InBearbeitung')::int`,
        abgeschlossen: sql<number>`count(*) filter (where ${hinweise.status} = 'Abgeschlossen')::int`,
      })
      .from(hinweise);

    return NextResponse.json({
      completedCount: completedResult.count,
      avgProcessingDays: Number(avgResult.avg),
      onTimePercentage,
      statusCounts: {
        Neu: statusCounts.neu,
        InBearbeitung: statusCounts.inBearbeitung,
        Abgeschlossen: statusCounts.abgeschlossen,
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
