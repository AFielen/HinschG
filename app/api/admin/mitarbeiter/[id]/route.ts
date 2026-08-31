import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { mitarbeiter, kunden } from '@/lib/db/schema';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;

    // mitarbeiter hat FORCE RLS — Zugriff nur über withTenant
    const [row] = await withTenant(kundeScopeOf(session), (tx) =>
      tx
        .select({
          id: mitarbeiter.id,
          kundeId: mitarbeiter.kundeId,
          firma: kunden.firma,
          anrede: mitarbeiter.anrede,
          vorname: mitarbeiter.vorname,
          nachname: mitarbeiter.nachname,
          email1: mitarbeiter.email1,
          email2: mitarbeiter.email2,
          telefon: mitarbeiter.telefon,
          mobil: mitarbeiter.mobil,
          anschrift: mitarbeiter.anschrift,
          funktion: mitarbeiter.funktion,
          istMeldestelle: mitarbeiter.istMeldestelle,
          istGeschaeftsfuehrer: mitarbeiter.istGeschaeftsfuehrer,
          createdAt: mitarbeiter.createdAt,
          updatedAt: mitarbeiter.updatedAt,
        })
        .from(mitarbeiter)
        .leftJoin(kunden, eq(mitarbeiter.kundeId, kunden.id))
        .where(eq(mitarbeiter.id, Number(id)))
        .limit(1),
    );

    if (!row) {
      return NextResponse.json({ error: 'Mitarbeiter nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/mitarbeiter/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  kundeId: z.number({ coerce: true }).optional(),
  anrede: z.enum(['Frau', 'Herr']).optional(),
  vorname: z.string().optional(),
  nachname: z.string().optional(),
  email1: z.string().email().max(320).optional().or(z.literal('')),
  email2: z.string().email().max(320).optional().or(z.literal('')),
  telefon: z.string().optional(),
  mobil: z.string().optional(),
  anschrift: z.string().optional(),
  funktion: z.string().optional(),
  istMeldestelle: z.boolean().optional(),
  istGeschaeftsfuehrer: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(request, 'admin');
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const updates = {
      ...data,
      ...(data.email1 !== undefined ? { email1: data.email1 || null } : {}),
      ...(data.email2 !== undefined ? { email2: data.email2 || null } : {}),
    };

    // mitarbeiter hat FORCE RLS — Zugriff nur über withTenant
    const [updated] = await withTenant(kundeScopeOf(session), (tx) =>
      tx
        .update(mitarbeiter)
        .set(updates)
        .where(eq(mitarbeiter.id, Number(id)))
        .returning(),
    );

    if (!updated) {
      return NextResponse.json({ error: 'Mitarbeiter nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    // FK-Verletzung: Kunde existiert nicht
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      return NextResponse.json(
        { error: 'Der angegebene Kunde existiert nicht' },
        { status: 400 },
      );
    }
    console.error('PUT /api/admin/mitarbeiter/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(request, 'admin');
    const { id } = await params;

    // mitarbeiter hat FORCE RLS — Zugriff nur über withTenant
    const [deleted] = await withTenant(kundeScopeOf(session), (tx) =>
      tx
        .delete(mitarbeiter)
        .where(eq(mitarbeiter.id, Number(id)))
        .returning({ id: mitarbeiter.id }),
    );

    if (!deleted) {
      return NextResponse.json({ error: 'Mitarbeiter nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    console.error('DELETE /api/admin/mitarbeiter/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
