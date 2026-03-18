import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emailKonten } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(request);
    const { id } = await params;

    const [deleted] = await db
      .delete(emailKonten)
      .where(eq(emailKonten.id, Number(id)))
      .returning({ id: emailKonten.id });

    if (!deleted) {
      return NextResponse.json({ error: 'E-Mail-Konto nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('DELETE /api/admin/email-konten/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
