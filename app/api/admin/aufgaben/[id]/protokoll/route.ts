import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { aufgaben, hinweise, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

const protokollSchema = z.object({
  meldung: z.string().min(1, 'Protokoll-Text darf nicht leer sein.'),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const body = await request.json();
    const data = protokollSchema.parse(body);

    const entry = await withTenant(scope, async (tx) => {
      const where =
        scope === 'all'
          ? eq(aufgaben.id, Number(id))
          : and(eq(aufgaben.id, Number(id)), eq(hinweise.kundeId, scope));

      const [aufgabe] = await tx
        .select({ hinweisId: aufgaben.hinweisId })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(where)
        .limit(1);

      if (!aufgabe) return null;

      const [neu] = await tx
        .insert(archiv)
        .values({
          hinweisId: aufgabe.hinweisId,
          art: 'Log',
          ersteller: session.username,
          meldung: data.meldung,
        })
        .returning();

      return neu;
    });

    if (!entry) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/aufgaben/[id]/protokoll error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
