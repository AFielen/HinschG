import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { hinweise, nachrichten, archiv } from '@/lib/db/schema';
import { withTenant } from '@/lib/db/tenant';
import { requirePostfach } from '@/lib/auth/middleware';

const nachrichtSchema = z.object({
  inhalt: z
    .string()
    .min(1, 'Bitte geben Sie eine Nachricht ein.')
    .max(10000),
});

export async function POST(request: NextRequest) {
  try {
    const { hinweisId } = await requirePostfach(request);
    const body = await request.json();
    const data = nachrichtSchema.parse(body);

    const gespeichert = await withTenant('all', async (tx) => {
      const [hinweis] = await tx
        .select({ id: hinweise.id })
        .from(hinweise)
        .where(eq(hinweise.id, hinweisId))
        .limit(1);

      if (!hinweis) return false;

      await tx.insert(nachrichten).values({
        hinweisId,
        richtung: 'VonHinweisgeber',
        inhalt: data.inhalt,
        ersteller: 'Hinweisgeber',
      });

      await tx.insert(archiv).values({
        hinweisId,
        art: 'Log',
        ersteller: 'System',
        meldung: 'Nachricht des Hinweisgebers eingegangen',
      });

      return true;
    });

    if (!gespeichert) {
      return NextResponse.json(
        { error: 'Meldung wurde nicht gefunden.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe. Bitte prüfen Sie Ihre Nachricht.' },
        { status: 400 },
      );
    }
    console.error('POST /api/public/postfach/nachricht error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
