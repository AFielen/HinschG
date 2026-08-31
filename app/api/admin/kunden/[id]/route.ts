import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { kunden, kundengruppen, mitarbeiter, hinweise } from '@/lib/db/schema';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const { id } = await params;

    // Nicht-Admins mit Mandanten-Scope dürfen nur den eigenen Kunden sehen
    const scope = kundeScopeOf(session);
    if (scope !== 'all' && scope !== Number(id)) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const [kunde] = await db
      .select({
        id: kunden.id,
        firma: kunden.firma,
        strasse: kunden.strasse,
        plz: kunden.plz,
        ort: kunden.ort,
        telefon: kunden.telefon,
        telefax: kunden.telefax,
        firmenEmail: kunden.firmenEmail,
        logoName: kunden.logoName,
        logoUrl: kunden.logoUrl,
        kundengruppeId: kunden.kundengruppeId,
        kundengruppeName: kundengruppen.name,
        kundenKuerzel: kunden.kundenKuerzel,
        aboModell: kunden.aboModell,
        meldestelleEmail: kunden.meldestelleEmail,
        ansprechpartner: kunden.ansprechpartner,
        meldestelleStrasse: kunden.meldestelleStrasse,
        meldestellePlz: kunden.meldestellePlz,
        meldestelleOrt: kunden.meldestelleOrt,
        meldestelleInternetseite: kunden.meldestelleInternetseite,
        meldestelleEmailPublic: kunden.meldestelleEmailPublic,
        meldestelleTelefonPublic: kunden.meldestelleTelefonPublic,
        linkImpressum: kunden.linkImpressum,
        linkDatenschutz: kunden.linkDatenschutz,
        createdAt: kunden.createdAt,
        updatedAt: kunden.updatedAt,
      })
      .from(kunden)
      .leftJoin(kundengruppen, eq(kunden.kundengruppeId, kundengruppen.id))
      .where(eq(kunden.id, Number(id)))
      .limit(1);

    if (!kunde) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    // mitarbeiter hat FORCE RLS — Zugriff nur über withTenant
    const mitarbeiterRows = await withTenant(scope, (tx) =>
      tx.select().from(mitarbeiter).where(eq(mitarbeiter.kundeId, Number(id))),
    );

    return NextResponse.json({ ...kunde, mitarbeiter: mitarbeiterRows });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/kunden/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  firma: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  telefon: z.string().optional(),
  telefax: z.string().optional(),
  firmenEmail: z.string().email().optional(),
  logoName: z.string().optional(),
  logoUrl: z.string().optional(),
  kundengruppeId: z.number({ coerce: true }).nullable().optional(),
  kundenKuerzel: z.string().optional(),
  aboModell: z.string().optional(),
  meldestelleEmail: z.string().email().optional(),
  ansprechpartner: z.string().optional(),
  meldestelleStrasse: z.string().optional(),
  meldestellePlz: z.string().optional(),
  meldestelleOrt: z.string().optional(),
  meldestelleInternetseite: z.string().optional(),
  meldestelleEmailPublic: z.string().optional(),
  meldestelleTelefonPublic: z.string().optional(),
  linkImpressum: z.string().optional(),
  linkDatenschutz: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(request, 'admin');
    const { id } = await params;
    const body = await request.json();
    const data = updateSchema.parse(body);

    const [updated] = await db
      .update(kunden)
      .set(data)
      .where(eq(kunden.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
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
    console.error('PUT /api/admin/kunden/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(request, 'admin');
    const { id } = await params;
    const kundeId = Number(id);

    const [existing] = await db
      .select({ id: kunden.id })
      .from(kunden)
      .where(eq(kunden.id, kundeId))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Kunde nicht gefunden' }, { status: 404 });
    }

    // hinweise und mitarbeiter haben FORCE RLS — Zugriff nur über withTenant
    const result = await withTenant('all', async (tx) => {
      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(hinweise)
        .where(eq(hinweise.kundeId, kundeId));

      if (count > 0) {
        return { blocked: true as const };
      }

      await tx.delete(mitarbeiter).where(eq(mitarbeiter.kundeId, kundeId));
      await tx.delete(kunden).where(eq(kunden.id, kundeId));
      return { blocked: false as const };
    });

    if (result.blocked) {
      return NextResponse.json(
        {
          error:
            'Für diese Organisation existieren Meldungen. Löschen ist nicht möglich, solange Meldungen vorhanden sind.',
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    // FK-Verletzung (z.B. Benutzer sind dem Kunden zugeordnet)
    if (err && typeof err === 'object' && 'code' in err && err.code === '23503') {
      return NextResponse.json(
        {
          error:
            'Der Kunde wird noch von anderen Datensätzen (z.B. Benutzern) referenziert und kann nicht gelöscht werden.',
        },
        { status: 409 },
      );
    }
    console.error('DELETE /api/admin/kunden/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
