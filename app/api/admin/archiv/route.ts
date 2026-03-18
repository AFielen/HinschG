import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const url = new URL(request.url);
    const hinweisId = url.searchParams.get('hinweis_id');
    const art = url.searchParams.get('art');

    if (!hinweisId) {
      return NextResponse.json({ error: 'hinweis_id ist erforderlich' }, { status: 400 });
    }

    const conditions = [eq(archiv.hinweisId, Number(hinweisId))];
    if (art && ['Kommunikation', 'Mail', 'Log'].includes(art)) {
      conditions.push(eq(archiv.art, art as 'Kommunikation' | 'Mail' | 'Log'));
    }

    const rows = await db
      .select()
      .from(archiv)
      .where(and(...conditions))
      .orderBy(desc(archiv.createdAt));

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
  ersteller: z.string().optional(),
  meldung: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const [entry] = await db
      .insert(archiv)
      .values({
        hinweisId: data.hinweisId,
        art: data.art,
        ersteller: data.ersteller || session.username,
        meldung: data.meldung,
      })
      .returning();

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
