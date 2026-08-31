import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { requireAuth } from '@/lib/auth/middleware';
import { kundeScopeOf } from '@/lib/db/tenant';
import { ladeAnhangMitScope, anhangPfad } from '@/lib/anhaenge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth(request);
    const scope = kundeScopeOf(session);
    const { id } = await params;

    const anhang = await ladeAnhangMitScope(Number(id), scope);
    if (!anhang) {
      return NextResponse.json({ error: 'Anhang nicht gefunden' }, { status: 404 });
    }

    let inhalt: Buffer;
    try {
      inhalt = await readFile(anhangPfad(anhang));
    } catch (err) {
      console.error('GET /api/admin/anhaenge/[id] Datei fehlt:', err);
      return NextResponse.json(
        { error: 'Die Datei ist nicht mehr vorhanden.' },
        { status: 404 },
      );
    }

    // ASCII-Fallback plus RFC-5987-Variante für Umlaute im Dateinamen
    const fallbackName = anhang.dateiname
      .replace(/[^\x20-\x7e]/g, '_')
      .replace(/["\\]/g, '_');

    return new NextResponse(new Uint8Array(inhalt), {
      status: 200,
      headers: {
        'Content-Type': anhang.mimeTyp,
        'Content-Length': String(inhalt.length),
        'Content-Disposition': `attachment; filename="${fallbackName}"; filename*=UTF-8''${encodeURIComponent(anhang.dateiname)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    console.error('GET /api/admin/anhaenge/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
