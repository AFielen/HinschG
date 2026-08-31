import { NextRequest, NextResponse } from 'next/server';
import { eq, and, asc } from 'drizzle-orm';
import { hinweise, anhaenge, archiv } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf, withTenant, type KundeScope } from '@/lib/db/tenant';
import {
  speichereAnhang,
  MAX_ANHANG_BYTES,
  ERLAUBTE_MIME_TYPEN,
} from '@/lib/anhaenge';

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

    const rows = await withTenant(scope, async (tx) => {
      const [hinweis] = await tx
        .select({ id: hinweise.id })
        .from(hinweise)
        .where(hinweisScopeWhere(hinweisId, scope))
        .limit(1);

      if (!hinweis) return null;

      return tx
        .select({
          id: anhaenge.id,
          nachrichtId: anhaenge.nachrichtId,
          dateiname: anhaenge.dateiname,
          mimeTyp: anhaenge.mimeTyp,
          groesse: anhaenge.groesse,
          hochgeladenVon: anhaenge.hochgeladenVon,
          createdAt: anhaenge.createdAt,
        })
        .from(anhaenge)
        .where(eq(anhaenge.hinweisId, hinweisId))
        .orderBy(asc(anhaenge.createdAt));
    });

    if (rows === null) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    return NextResponse.json({ data: rows });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/hinweise/[id]/anhang error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;
    const hinweisId = Number(id);

    const gefunden = await withTenant(scope, async (tx) => {
      const [hinweis] = await tx
        .select({ id: hinweise.id })
        .from(hinweise)
        .where(hinweisScopeWhere(hinweisId, scope))
        .limit(1);
      return Boolean(hinweis);
    });

    if (!gefunden) {
      return NextResponse.json({ error: 'Hinweis nicht gefunden' }, { status: 404 });
    }

    const formData = await request.formData();
    const datei = formData.get('datei');

    if (!(datei instanceof File) || datei.size === 0) {
      return NextResponse.json({ error: 'Keine Datei übermittelt.' }, { status: 400 });
    }
    if (datei.size > MAX_ANHANG_BYTES) {
      return NextResponse.json(
        { error: 'Die Datei ist zu groß (maximal 10 MB).' },
        { status: 400 },
      );
    }
    if (!ERLAUBTE_MIME_TYPEN.includes(datei.type)) {
      return NextResponse.json(
        { error: 'Dieser Dateityp ist nicht erlaubt. Erlaubt sind PDF, JPG, PNG, WebP, TXT, DOCX und XLSX.' },
        { status: 400 },
      );
    }

    const anhang = await speichereAnhang({
      hinweisId,
      datei,
      hochgeladenVon: session.username,
    });

    await withTenant(scope, (tx) =>
      tx.insert(archiv).values({
        hinweisId,
        art: 'Log',
        ersteller: session.username,
        meldung: `Anhang hochgeladen: ${anhang.dateiname}`,
      }),
    );

    return NextResponse.json(
      { id: anhang.id, dateiname: anhang.dateiname, groesse: anhang.groesse },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('POST /api/admin/hinweise/[id]/anhang error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
