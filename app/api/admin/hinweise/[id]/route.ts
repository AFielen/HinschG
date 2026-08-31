import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, and, asc } from 'drizzle-orm';
import { hinweise, aufgaben, archiv, kunden, nachrichten } from '@/lib/db/schema';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant, type KundeScope } from '@/lib/db/tenant';
import { decryptField, encryptField } from '@/lib/crypto';
import { berechneLoeschdatum } from '@/lib/fristen';
import { loescheHinweis } from '@/lib/loeschung';

/** Scope-Bedingung für einen einzelnen Hinweis (Defense in Depth zur RLS). */
function hinweisScopeWhere(hinweisId: number, scope: KundeScope) {
  return scope === 'all'
    ? eq(hinweise.id, hinweisId)
    : and(eq(hinweise.id, hinweisId), eq(hinweise.kundeId, scope));
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const hinweisId = Number(id);

    const result = await withTenant(scope, async (tx) => {
      const [hinweis] = await tx
        .select({
          id: hinweise.id,
          aktenzeichen: hinweise.aktenzeichen,
          status: hinweise.status,
          istAnonym: hinweise.istAnonym,
          kundeId: hinweise.kundeId,
          kundeName: kunden.firma,
          meldeweg: hinweise.meldeweg,
          kategorie: hinweise.kategorie,
          datumVerstoss: hinweise.datumVerstoss,
          beteiligte: hinweise.beteiligte,
          meldungstext: hinweise.meldungstext,
          hinweisgeberAnrede: hinweise.hinweisgeberAnrede,
          hinweisgeberVorname: hinweise.hinweisgeberVorname,
          hinweisgeberNachname: hinweise.hinweisgeberNachname,
          hinweisgeberTelefon: hinweise.hinweisgeberTelefon,
          hinweisgeberEmail: hinweise.hinweisgeberEmail,
          hinweisgeberAnmerkungen: hinweise.hinweisgeberAnmerkungen,
          eingangsbestaetigungAm: hinweise.eingangsbestaetigungAm,
          eingangsbestaetigungFaelligAm: hinweise.eingangsbestaetigungFaelligAm,
          rueckmeldungAm: hinweise.rueckmeldungAm,
          rueckmeldungFaelligAm: hinweise.rueckmeldungFaelligAm,
          abgeschlossenAm: hinweise.abgeschlossenAm,
          loeschenAm: hinweise.loeschenAm,
          createdAt: hinweise.createdAt,
          updatedAt: hinweise.updatedAt,
        })
        .from(hinweise)
        .leftJoin(kunden, eq(hinweise.kundeId, kunden.id))
        .where(hinweisScopeWhere(hinweisId, scope))
        .limit(1);

      if (!hinweis) return null;

      const aufgabenRows = await tx
        .select()
        .from(aufgaben)
        .where(eq(aufgaben.hinweisId, hinweisId));

      const archivRows = await tx
        .select()
        .from(archiv)
        .where(eq(archiv.hinweisId, hinweisId));

      const nachrichtenRows = await tx
        .select()
        .from(nachrichten)
        .where(eq(nachrichten.hinweisId, hinweisId))
        .orderBy(asc(nachrichten.createdAt));

      return { hinweis, aufgabenRows, archivRows, nachrichtenRows };
    });

    if (!result) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      ...result.hinweis,
      hinweisgeberVorname: decryptField(result.hinweis.hinweisgeberVorname),
      hinweisgeberNachname: decryptField(result.hinweis.hinweisgeberNachname),
      hinweisgeberTelefon: decryptField(result.hinweis.hinweisgeberTelefon),
      hinweisgeberEmail: decryptField(result.hinweis.hinweisgeberEmail),
      hinweisgeberAnmerkungen: decryptField(result.hinweis.hinweisgeberAnmerkungen),
      aufgaben: result.aufgabenRows,
      archiv: result.archivRows,
      nachrichten: result.nachrichtenRows,
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/hinweise/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const updateSchema = z.object({
  status: z.enum(['Neu', 'InBearbeitung', 'Abgeschlossen']).optional(),
  istAnonym: z.boolean().optional(),
  kundeId: z.number({ coerce: true }).optional(),
  meldeweg: z.enum(['Hinweisgebersystem', 'Telefon', 'Email', 'Post']).optional(),
  kategorie: z.string().optional(),
  datumVerstoss: z.string().optional(),
  beteiligte: z.string().optional(),
  meldungstext: z.string().optional(),
  hinweisgeberAnrede: z.enum(['Frau', 'Herr']).optional(),
  hinweisgeberVorname: z.string().optional(),
  hinweisgeberNachname: z.string().optional(),
  hinweisgeberTelefon: z.string().optional(),
  hinweisgeberEmail: z.string().optional(),
  hinweisgeberAnmerkungen: z.string().optional(),
});

const PII_FELDER = [
  'hinweisgeberVorname',
  'hinweisgeberNachname',
  'hinweisgeberTelefon',
  'hinweisgeberEmail',
  'hinweisgeberAnmerkungen',
] as const;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const hinweisId = Number(id);
    const body = await request.json();
    const data = updateSchema.parse(body);

    if (data.kundeId !== undefined && scope !== 'all' && data.kundeId !== scope) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    const result = await withTenant(scope, async (tx) => {
      const [existing] = await tx
        .select({ id: hinweise.id, status: hinweise.status })
        .from(hinweise)
        .where(hinweisScopeWhere(hinweisId, scope))
        .limit(1);

      if (!existing) return null;

      const updateData: Record<string, unknown> = { ...data };
      for (const feld of PII_FELDER) {
        if (data[feld] !== undefined) {
          updateData[feld] = encryptField(data[feld]);
        }
      }

      // Abschluss-Logik: Löschfrist setzen bzw. zurücknehmen (§ 11 Abs. 5 HinSchG)
      const statusGeaendert = data.status !== undefined && data.status !== existing.status;
      if (statusGeaendert && data.status === 'Abgeschlossen') {
        const jetzt = new Date();
        updateData.abgeschlossenAm = jetzt;
        updateData.loeschenAm = berechneLoeschdatum(jetzt);
      }
      if (statusGeaendert && existing.status === 'Abgeschlossen' && data.status !== 'Abgeschlossen') {
        updateData.abgeschlossenAm = null;
        updateData.loeschenAm = null;
      }

      const [updated] = await tx
        .update(hinweise)
        .set(updateData)
        .where(hinweisScopeWhere(hinweisId, scope))
        .returning();

      if (statusGeaendert) {
        await tx.insert(archiv).values({
          hinweisId,
          art: 'Log',
          ersteller: session.username,
          meldung: `Status geändert: ${existing.status} → ${data.status}`,
        });
      }

      await tx.insert(archiv).values({
        hinweisId,
        art: 'Log',
        ersteller: session.username,
        meldung: `Hinweis aktualisiert von ${session.username}`,
      });

      return updated;
    });

    if (!result) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        zugangscodeHash: undefined,
        hinweisgeberVorname: decryptField(result.hinweisgeberVorname),
        hinweisgeberNachname: decryptField(result.hinweisgeberNachname),
        hinweisgeberTelefon: decryptField(result.hinweisgeberTelefon),
        hinweisgeberEmail: decryptField(result.hinweisgeberEmail),
        hinweisgeberAnmerkungen: decryptField(result.hinweisgeberAnmerkungen),
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/hinweise/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(request, 'admin');
    const { id } = await params;
    const hinweisId = Number(id);

    const geloescht = await loescheHinweis(
      hinweisId,
      `Manuelle Löschung durch ${session.username}`,
    );

    if (!geloescht) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    console.error('DELETE /api/admin/hinweise/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
