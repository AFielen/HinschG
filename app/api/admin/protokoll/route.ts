import { NextRequest, NextResponse } from 'next/server';
import { sql, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { systemProtokoll } from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireRole(request, 'admin');
    const url = new URL(request.url);
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(systemProtokoll)
      .orderBy(desc(systemProtokoll.createdAt), desc(systemProtokoll.id))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(systemProtokoll);

    return NextResponse.json({ data: rows, total: count, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    console.error('GET /api/admin/protokoll error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
