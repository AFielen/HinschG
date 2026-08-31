import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emails, hinweise } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant, type KundeScope } from '@/lib/db/tenant';

/**
 * Lädt eine E-Mail nur, wenn sie im Mandanten-Scope liegt. Fallgebundene
 * E-Mails werden über den RLS-geschützten hinweise-Join geprüft;
 * fallungebundene (hinweisId null) sind nur für zentrale Nutzer ('all')
 * sichtbar.
 */
async function ladeEmailImScope(
  tx: typeof db,
  id: number,
  scope: KundeScope,
): Promise<typeof emails.$inferSelect | undefined> {
  if (scope === 'all') {
    const [email] = await tx.select().from(emails).where(eq(emails.id, id)).limit(1);
    return email;
  }
  const [row] = await tx
    .select({ email: emails })
    .from(emails)
    .innerJoin(hinweise, eq(emails.hinweisId, hinweise.id))
    .where(eq(emails.id, id))
    .limit(1);
  return row?.email;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;

    const email = await withTenant(scope, (tx) => ladeEmailImScope(tx, Number(id), scope));

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
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updated = await withTenant(scope, async (tx) => {
      const vorhanden = await ladeEmailImScope(tx, Number(id), scope);
      if (!vorhanden) return undefined;
      const [row] = await tx
        .update(emails)
        .set(data)
        .where(eq(emails.id, Number(id)))
        .returning();
      return row;
    });

    if (!updated) {
      return NextResponse.json({ error: 'E-Mail nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
    }
    console.error('PUT /api/admin/emails/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;

    const deleted = await withTenant(scope, async (tx) => {
      const vorhanden = await ladeEmailImScope(tx, Number(id), scope);
      if (!vorhanden) return undefined;
      const [row] = await tx
        .delete(emails)
        .where(eq(emails.id, Number(id)))
        .returning({ id: emails.id });
      return row;
    });

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
