import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { kundengruppen } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
    const rows = await db.select().from(kundengruppen);
    return NextResponse.json(rows);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/kundengruppen error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich'),
});

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const data = createSchema.parse(body);

    const [row] = await db
      .insert(kundengruppen)
      .values(data)
      .returning();

    return NextResponse.json({ success: true, data: row }, { status: 201 });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/kundengruppen error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
