import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { archiv, hinweise } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant, type KundeScope } from '@/lib/db/tenant';
import type { db } from '@/lib/db';

/** Prüft, ob der Hinweis existiert und im Mandanten-Scope liegt. */
async function hinweisImScope(
  tx: typeof db,
  hinweisId: number,
  scope: KundeScope,
): Promise<boolean> {
  const where =
    scope === 'all'
      ? eq(hinweise.id, hinweisId)
      : and(eq(hinweise.id, hinweisId), eq(hinweise.kundeId, scope));

  const [row] = await tx
    .select({ id: hinweise.id })
    .from(hinweise)
    .where(where)
    .limit(1);

  return !!row;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const url = new URL(request.url);
    const hinweisId = url.searchParams.get('hinweis_id');
    const art = url.searchParams.get('art');

    if (!hinweisId) {
      return NextResponse.json({ error: 'hinweis_id ist erforderlich' }, { status: 400 });
    }

    const rows = await withTenant(scope, async (tx) => {
      if (!(await hinweisImScope(tx, Number(hinweisId), scope))) return null;

      const conditions = [eq(archiv.hinweisId, Number(hinweisId))];
      if (art && ['Kommunikation', 'Mail', 'Log'].includes(art)) {
        conditions.push(eq(archiv.art, art as 'Kommunikation' | 'Mail' | 'Log'));
      }

      return tx
        .select()
        .from(archiv)
        .where(and(...conditions))
        .orderBy(desc(archiv.createdAt));
    });

    if (rows === null) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/archiv error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  hinweisId: z.number({ coerce: true }),
  art: z.enum(['Kommunikation', 'Mail', 'Log']),
  meldung: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const body = await request.json();
    const data = createSchema.parse(body);

    const entry = await withTenant(scope, async (tx) => {
      if (!(await hinweisImScope(tx, data.hinweisId, scope))) return null;

      // ersteller kommt IMMER aus der Session, nie aus dem Request-Body
      const [neu] = await tx
        .insert(archiv)
        .values({
          hinweisId: data.hinweisId,
          art: data.art,
          ersteller: session.username,
          meldung: data.meldung,
        })
        .returning();

      return neu;
    });

    if (!entry) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/archiv error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
