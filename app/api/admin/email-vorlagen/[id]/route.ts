import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emailVorlagen } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [row] = await db
      .select()
      .from(emailVorlagen)
      .where(eq(emailVorlagen.id, Number(id)))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: 'Vorlage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/email-vorlagen/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  templateName: z.string().optional(),
  fromName: z.string().optional(),
  subject: z.string().optional(),
  htmlContent: z.string().optional(),
  hasAttachment: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const [updated] = await db
      .update(emailVorlagen)
      .set(data)
      .where(eq(emailVorlagen.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Vorlage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/email-vorlagen/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [deleted] = await db
      .delete(emailVorlagen)
      .where(eq(emailVorlagen.id, Number(id)))
      .returning({ id: emailVorlagen.id });

    if (!deleted) {
      return NextResponse.json({ error: 'Vorlage nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('DELETE /api/admin/email-vorlagen/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
