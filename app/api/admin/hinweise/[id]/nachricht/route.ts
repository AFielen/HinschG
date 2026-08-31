import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { hinweise, nachrichten, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

const nachrichtSchema = z.object({
  inhalt: z
    .string()
    .min(1, 'Nachricht darf nicht leer sein.')
    .max(10000, 'Nachricht darf höchstens 10000 Zeichen lang sein.'),
  alsRueckmeldung: z.boolean().optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const hinweisId = Number(id);
    const body = await request.json();
    const data = nachrichtSchema.parse(body);

    const result = await withTenant(scope, async (tx) => {
      const where =
        scope === 'all'
          ? eq(hinweise.id, hinweisId)
          : and(eq(hinweise.id, hinweisId), eq(hinweise.kundeId, scope));

      const [hinweis] = await tx
        .select({ id: hinweise.id, rueckmeldungAm: hinweise.rueckmeldungAm })
        .from(hinweise)
        .where(where)
        .limit(1);

      if (!hinweis) return null;

      const [nachricht] = await tx
        .insert(nachrichten)
        .values({
          hinweisId: hinweis.id,
          richtung: 'AnHinweisgeber',
          inhalt: data.inhalt,
          ersteller: session.username,
        })
        .returning();

      // Rückmeldung nach § 17 Abs. 2 HinSchG dokumentieren (nur beim ersten Mal)
      if (data.alsRueckmeldung && hinweis.rueckmeldungAm === null) {
        await tx
          .update(hinweise)
          .set({ rueckmeldungAm: new Date() })
          .where(eq(hinweise.id, hinweis.id));
      }

      await tx.insert(archiv).values({
        hinweisId: hinweis.id,
        art: 'Log',
        ersteller: session.username,
        meldung: 'Nachricht an Hinweisgeber gesendet',
      });

      return nachricht;
    });

    if (!result) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/hinweise/[id]/nachricht error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
