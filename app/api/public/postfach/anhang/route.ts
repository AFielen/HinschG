import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { hinweise, archiv } from '@/lib/db/schema';
import { withTenant } from '@/lib/db/tenant';
import { requirePostfach } from '@/lib/auth/middleware';
import {
  speichereAnhang,
  MAX_ANHANG_BYTES,
  ERLAUBTE_MIME_TYPEN,
} from '@/lib/anhaenge';

/**
 * Anhang-Upload durch den Hinweisgeber (multipart/form-data, Feld 'datei').
 */
export async function POST(request: NextRequest) {
  try {
    const { hinweisId } = await requirePostfach(request);

    const formData = await request.formData();
    const datei = formData.get('datei');

    if (!(datei instanceof File)) {
      return NextResponse.json(
        { error: 'Bitte wählen Sie eine Datei aus.' },
        { status: 400 },
      );
    }

    // Vorab-Validierung für saubere 400er-Antworten
    // (speichereAnhang prüft zusätzlich als Defense-in-Depth)
    if (datei.size === 0) {
      return NextResponse.json(
        { error: 'Die Datei ist leer.' },
        { status: 400 },
      );
    }
    if (datei.size > MAX_ANHANG_BYTES) {
      return NextResponse.json(
        { error: 'Die Datei ist zu groß (maximal 10 MB).' },
        { status: 400 },
      );
    }
    if (!ERLAUBTE_MIME_TYPEN.includes(datei.type)) {
      return NextResponse.json(
        {
          error:
            'Dieser Dateityp ist nicht erlaubt. Erlaubt sind PDF, JPG, PNG, WebP, TXT, DOCX und XLSX.',
        },
        { status: 400 },
      );
    }

    // Existenz der Meldung prüfen (kann durch Löschkonzept entfallen sein)
    const vorhanden = await withTenant('all', async (tx) => {
      const [hinweis] = await tx
        .select({ id: hinweise.id })
        .from(hinweise)
        .where(eq(hinweise.id, hinweisId))
        .limit(1);
      return Boolean(hinweis);
    });

    if (!vorhanden) {
      return NextResponse.json(
        { error: 'Meldung wurde nicht gefunden.' },
        { status: 404 },
      );
    }

    const anhang = await speichereAnhang({
      hinweisId,
      datei,
      hochgeladenVon: 'Hinweisgeber',
    });

    await withTenant('all', (tx) =>
      tx.insert(archiv).values({
        hinweisId,
        art: 'Log',
        ersteller: 'System',
        meldung: 'Anhang nachgereicht',
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
    console.error('POST /api/public/postfach/anhang error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
