import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { requirePostfach } from '@/lib/auth/middleware';
import { ladeAnhangMitScope, anhangPfad } from '@/lib/anhaenge';

/**
 * Datei-Download für den Hinweisgeber — ausschließlich Anhänge der
 * eigenen Meldung (hinweisId aus der Postfach-Session).
 */

/** RFC-5987-konformer Content-Disposition-Header mit UTF-8-Dateinamen. */
function contentDisposition(dateiname: string): string {
  const fallback = dateiname.replace(/[^\x20-\x7e]/g, '_').replace(/"/g, "'");
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(dateiname)}`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { hinweisId } = await requirePostfach(request);

    const { id } = await params;
    const anhangId = Number(id);
    if (!Number.isInteger(anhangId) || anhangId <= 0) {
      return NextResponse.json(
        { error: 'Anhang wurde nicht gefunden.' },
        { status: 404 },
      );
    }

    const anhang = await ladeAnhangMitScope(anhangId, 'all');

    // NUR Anhänge der eigenen Meldung ausliefern
    if (!anhang || anhang.hinweisId !== hinweisId) {
      return NextResponse.json(
        { error: 'Anhang wurde nicht gefunden.' },
        { status: 404 },
      );
    }

    let inhalt: Buffer;
    try {
      inhalt = await readFile(anhangPfad(anhang));
    } catch {
      console.error(
        `GET /api/public/postfach/anhang/${anhangId}: Datei fehlt auf der Platte (${anhang.speicherName})`,
      );
      return NextResponse.json(
        { error: 'Anhang wurde nicht gefunden.' },
        { status: 404 },
      );
    }

    return new NextResponse(new Uint8Array(inhalt), {
      status: 200,
      headers: {
        'Content-Type': anhang.mimeTyp,
        'Content-Length': String(inhalt.length),
        'Content-Disposition': contentDisposition(anhang.dateiname),
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/public/postfach/anhang/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
