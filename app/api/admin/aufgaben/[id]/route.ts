import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { aufgaben, hinweise, users, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant, type KundeScope } from '@/lib/db/tenant';

/** Scope-Bedingung für eine Aufgabe über den zugehörigen Hinweis. */
function aufgabeScopeWhere(aufgabeId: number, scope: KundeScope) {
  return scope === 'all'
    ? eq(aufgaben.id, aufgabeId)
    : and(eq(aufgaben.id, aufgabeId), eq(hinweise.kundeId, scope));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;

    const [aufgabe] = await withTenant(scope, (tx) =>
      tx
        .select({
          id: aufgaben.id,
          titel: aufgaben.titel,
          beschreibung: aufgaben.beschreibung,
          status: aufgaben.status,
          schritt: aufgaben.schritt,
          schrittName: aufgaben.schrittName,
          faelligBis: aufgaben.faelligBis,
          startDatum: aufgaben.startDatum,
          erledigtAm: aufgaben.erledigtAm,
          hinweisId: aufgaben.hinweisId,
          aktenzeichen: hinweise.aktenzeichen,
          bearbeiterId: aufgaben.bearbeiterId,
          bearbeiterName: users.displayName,
          createdAt: aufgaben.createdAt,
          updatedAt: aufgaben.updatedAt,
        })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .leftJoin(users, eq(aufgaben.bearbeiterId, users.id))
        .where(aufgabeScopeWhere(Number(id), scope))
        .limit(1),
    );

    if (!aufgabe) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json(aufgabe);
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/aufgaben/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['Offen', 'InBearbeitung', 'Abgeschlossen']).optional(),
  bearbeiterId: z.number({ coerce: true }).nullable().optional(),
  titel: z.string().optional(),
  beschreibung: z.string().optional(),
  faelligBis: z.string().nullable().optional(),
  schritt: z.number().optional(),
  schrittName: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const result = await withTenant(scope, async (tx) => {
      const [existing] = await tx
        .select({
          id: aufgaben.id,
          titel: aufgaben.titel,
          status: aufgaben.status,
          bearbeiterId: aufgaben.bearbeiterId,
          hinweisId: aufgaben.hinweisId,
        })
        .from(aufgaben)
        .innerJoin(hinweise, eq(aufgaben.hinweisId, hinweise.id))
        .where(aufgabeScopeWhere(Number(id), scope))
        .limit(1);

      if (!existing) return null;

      const updateData: Record<string, unknown> = { ...data };
      if (data.status === 'InBearbeitung' && !data.faelligBis) {
        updateData.startDatum = new Date();
      }
      if (data.status === 'Abgeschlossen') {
        updateData.erledigtAm = new Date();
      }
      if (data.faelligBis !== undefined) {
        updateData.faelligBis = data.faelligBis ? new Date(data.faelligBis) : null;
      }

      const [updated] = await tx
        .update(aufgaben)
        .set(updateData)
        .where(eq(aufgaben.id, existing.id))
        .returning();

      // Statuswechsel protokollieren
      if (data.status !== undefined && data.status !== existing.status) {
        await tx.insert(archiv).values({
          hinweisId: existing.hinweisId,
          art: 'Log',
          ersteller: session.username,
          meldung: `Aufgabe "${existing.titel}": Status geändert: ${existing.status} → ${data.status}`,
        });
      }

      // Bearbeiter-Zuweisung protokollieren
      if (data.bearbeiterId !== undefined && data.bearbeiterId !== existing.bearbeiterId) {
        let meldung = `Aufgabe "${existing.titel}": Bearbeiter-Zuweisung entfernt`;
        if (data.bearbeiterId !== null) {
          const [bearbeiter] = await tx
            .select({ displayName: users.displayName, username: users.username })
            .from(users)
            .where(eq(users.id, data.bearbeiterId))
            .limit(1);
          const name = bearbeiter?.displayName || bearbeiter?.username || `Benutzer ${data.bearbeiterId}`;
          meldung = `Aufgabe "${existing.titel}": Bearbeiter zugewiesen: ${name}`;
        }
        await tx.insert(archiv).values({
          hinweisId: existing.hinweisId,
          art: 'Log',
          ersteller: session.username,
          meldung,
        });
      }

      return updated;
    });

    if (!result) {
      return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/aufgaben/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
