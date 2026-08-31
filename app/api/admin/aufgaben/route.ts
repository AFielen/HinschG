import { NextRequest, NextResponse } from 'next/server';
import { eq, isNull, and, sql, desc } from 'drizzle-orm';
import { aufgaben, hinweise, users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const url = new URL(request.url);
    const tab = url.searchParams.get('tab') || 'offen';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    let tabWhere;
    switch (tab) {
      case 'meine':
        tabWhere = eq(aufgaben.bearbeiterId, session.userId);
        break;
      case 'nicht-zugewiesen':
        tabWhere = isNull(aufgaben.bearbeiterId);
        break;
      case 'abgeschlossen':
        tabWhere = eq(aufgaben.status, 'Abgeschlossen');
        break;
      default:
        tabWhere = eq(aufgaben.status, 'Offen');
    }

    // Mandanten-Bindung über den Hinweis (Defense in Depth zur RLS)
    const where =
      scope === 'all' ? tabWhere : and(tabWhere, eq(hinweise.kundeId, scope));

    const { rows, total } = await withTenant(scope, async (tx) => {
      const rows = await tx
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
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .leftJoin(users, eq(aufgaben.bearbeiterId, users.id))
        .where(where)
        .orderBy(desc(aufgaben.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(where);

      return { rows, total: count };
    });

    return NextResponse.json({ data: rows, total, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/aufgaben error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
