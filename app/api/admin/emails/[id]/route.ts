import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emails } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [email] = await db
      .select()
      .from(emails)
      .where(eq(emails.id, Number(id)))
      .limit(1);

    if (!email) {
      return NextResponse.json({ error: 'E-Mail nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(email);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/emails/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['Gesendet', 'Warteschlange', 'Fehler']).optional(),
  betreff: z.string().optional(),
  inhalt: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const [updated] = await db
      .update(emails)
      .set(data)
      .where(eq(emails.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'E-Mail nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/emails/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [deleted] = await db
      .delete(emails)
      .where(eq(emails.id, Number(id)))
      .returning({ id: emails.id });

    if (!deleted) {
      return NextResponse.json({ error: 'E-Mail nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('DELETE /api/admin/emails/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
