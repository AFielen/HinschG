import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq, ilike, or, and, sql, desc, asc } from 'drizzle-orm';
import { hinweise, kunden, aufgaben, archiv, nachrichten } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant } from '@/lib/db/tenant';
import { decryptField, encryptField } from '@/lib/crypto';
import { generateAktenzeichen, generateZugangscode } from '@/lib/aktenzeichen';
import { berechneFristen } from '@/lib/fristen';
import { hashPassword } from '@/lib/auth/password';

const EINGANGSBESTAETIGUNG_TEXT =
  'Ihre Meldung ist bei der Meldestelle eingegangen. Diese Nachricht bestätigt den Eingang gemäß § 17 Abs. 1 HinSchG. Sie erhalten spätestens innerhalb von drei Monaten eine Rückmeldung über geplante oder ergriffene Maßnahmen. Über dieses Postfach können Sie jederzeit Rückfragen stellen und Unterlagen nachreichen.';

function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  const e = err as { code?: string; cause?: { code?: string } };
  return e.code === '23505' || e.cause?.code === '23505';
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const sortBy = url.searchParams.get('sort') || 'createdAt';
    const sortOrder = url.searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (scope !== 'all') {
      // Defense in Depth zusätzlich zur RLS-Policy
      conditions.push(eq(hinweise.kundeId, scope));
    }
    if (status && ['Neu', 'InBearbeitung', 'Abgeschlossen'].includes(status)) {
      conditions.push(eq(hinweise.status, status as 'Neu' | 'InBearbeitung' | 'Abgeschlossen'));
    }
    if (search) {
      // Suche nur über unverschlüsselte Felder (hinweisgeber* liegt als Ciphertext vor)
      conditions.push(
        or(
          ilike(hinweise.aktenzeichen, `%${search}%`),
          ilike(hinweise.meldungstext, `%${search}%`),
        )!,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortCol = sortBy === 'aktenzeichen' ? hinweise.aktenzeichen
      : sortBy === 'status' ? hinweise.status
      : hinweise.createdAt;
    const orderFn = sortOrder === 'asc' ? asc : desc;

    const { rows, total } = await withTenant(scope, async (tx) => {
      const rows = await tx
        .select({
          id: hinweise.id,
          aktenzeichen: hinweise.aktenzeichen,
          status: hinweise.status,
          istAnonym: hinweise.istAnonym,
          kundeId: hinweise.kundeId,
          kundeName: kunden.firma,
          meldeweg: hinweise.meldeweg,
          kategorie: hinweise.kategorie,
          meldungstext: hinweise.meldungstext,
          hinweisgeberVorname: hinweise.hinweisgeberVorname,
          hinweisgeberNachname: hinweise.hinweisgeberNachname,
          eingangsbestaetigungAm: hinweise.eingangsbestaetigungAm,
          rueckmeldungAm: hinweise.rueckmeldungAm,
          rueckmeldungFaelligAm: hinweise.rueckmeldungFaelligAm,
          createdAt: hinweise.createdAt,
          updatedAt: hinweise.updatedAt,
        })
        .from(hinweise)
        .leftJoin(kunden, eq(hinweise.kundeId, kunden.id))
        .where(where)
        .orderBy(orderFn(sortCol))
        .limit(limit)
        .offset(offset);

      const [{ count }] = await tx
        .select({ count: sql<number>`count(*)::int` })
        .from(hinweise)
        .where(where);

      return { rows, total: count };
    });

    const data = rows.map((row) => ({
      ...row,
      hinweisgeberVorname: decryptField(row.hinweisgeberVorname),
      hinweisgeberNachname: decryptField(row.hinweisgeberNachname),
    }));

    return NextResponse.json({ data, total, page, limit });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/hinweise error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  istAnonym: z.boolean().default(false),
  kundeId: z.number({ coerce: true }),
  meldeweg: z.enum(['Hinweisgebersystem', 'Telefon', 'Email', 'Post']).optional(),
  kategorie: z.string().optional(),
  datumVerstoss: z.string().optional(),
  beteiligte: z.string().optional(),
  meldungstext: z.string().min(1),
  hinweisgeberAnrede: z.enum(['Frau', 'Herr']).optional(),
  hinweisgeberVorname: z.string().optional(),
  hinweisgeberNachname: z.string().optional(),
  hinweisgeberTelefon: z.string().optional(),
  hinweisgeberEmail: z.string().optional(),
  hinweisgeberAnmerkungen: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const body = await request.json();
    const data = createSchema.parse(body);

    if (scope !== 'all' && data.kundeId !== scope) {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }

    // Zugangscode wird nur einmalig im Klartext zurückgegeben (für den Hinweisgeber)
    const zugangscode = generateZugangscode();
    const zugangscodeHash = await hashPassword(zugangscode);

    let hinweis: typeof hinweise.$inferSelect | null = null;

    // Kollisions-Retry für das Aktenzeichen (Unique-Constraint)
    for (let versuch = 0; versuch < 5 && !hinweis; versuch++) {
      const aktenzeichen = generateAktenzeichen();
      try {
        hinweis = await withTenant(scope, async (tx) => {
          const eingang = new Date();
          const { eingangsbestaetigungFaelligAm, rueckmeldungFaelligAm } =
            berechneFristen(eingang);

          const [neu] = await tx
            .insert(hinweise)
            .values({
              aktenzeichen,
              status: 'Neu',
              istAnonym: data.istAnonym,
              kundeId: data.kundeId,
              meldeweg: data.meldeweg ?? 'Telefon',
              kategorie: data.kategorie ?? null,
              datumVerstoss: data.datumVerstoss ?? null,
              beteiligte: data.beteiligte ?? null,
              meldungstext: data.meldungstext,
              hinweisgeberAnrede: data.istAnonym ? null : (data.hinweisgeberAnrede ?? null),
              hinweisgeberVorname: encryptField(data.istAnonym ? null : data.hinweisgeberVorname),
              hinweisgeberNachname: encryptField(data.istAnonym ? null : data.hinweisgeberNachname),
              hinweisgeberTelefon: encryptField(data.istAnonym ? null : data.hinweisgeberTelefon),
              hinweisgeberEmail: encryptField(data.istAnonym ? null : data.hinweisgeberEmail),
              hinweisgeberAnmerkungen: encryptField(data.istAnonym ? null : data.hinweisgeberAnmerkungen),
              zugangscodeHash,
              eingangsbestaetigungAm: eingang,
              eingangsbestaetigungFaelligAm,
              rueckmeldungFaelligAm,
            })
            .returning();

          // Automatische Eingangsbestätigung (§ 17 Abs. 1 HinSchG)
          await tx.insert(nachrichten).values({
            hinweisId: neu.id,
            richtung: 'AnHinweisgeber',
            inhalt: EINGANGSBESTAETIGUNG_TEXT,
            ersteller: 'System',
          });

          await tx.insert(aufgaben).values({
            hinweisId: neu.id,
            titel: 'Relevanzprüfung',
            beschreibung: `Eingegangene Meldung (${aktenzeichen}) sichten und Relevanz prüfen.`,
            status: 'Offen',
            schritt: 1,
            schrittName: 'Relevanzprüfung',
            faelligBis: eingangsbestaetigungFaelligAm,
          });

          await tx.insert(archiv).values({
            hinweisId: neu.id,
            art: 'Log',
            ersteller: session.username,
            meldung: `Meldung manuell erfasst von ${session.username}. Aktenzeichen: ${aktenzeichen}`,
          });

          return neu;
        });
      } catch (err) {
        if (isUniqueViolation(err)) continue;
        throw err;
      }
    }

    if (!hinweis) {
      return NextResponse.json(
        { error: 'Aktenzeichen konnte nicht eindeutig erzeugt werden. Bitte versuchen Sie es erneut.' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        aktenzeichen: hinweis.aktenzeichen,
        zugangscode,
        data: {
          ...hinweis,
          zugangscodeHash: undefined,
          hinweisgeberVorname: decryptField(hinweis.hinweisgeberVorname),
          hinweisgeberNachname: decryptField(hinweis.hinweisgeberNachname),
          hinweisgeberTelefon: decryptField(hinweis.hinweisgeberTelefon),
          hinweisgeberEmail: decryptField(hinweis.hinweisgeberEmail),
          hinweisgeberAnmerkungen: decryptField(hinweis.hinweisgeberAnmerkungen),
        },
      },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('POST /api/admin/hinweise error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
