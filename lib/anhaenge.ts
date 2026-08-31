import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { and, eq, getTableColumns } from 'drizzle-orm';
import { anhaenge, hinweise } from './db/schema';
import { withTenant, type KundeScope } from './db/tenant';
import type { Anhang } from './db/types';

/**
 * Datei-Anhänge zu Hinweisen: Metadaten in der Tabelle anhaenge, die Dateien
 * selbst unter UPLOAD_DIR (Env, Default './uploads') mit zufälligem
 * Speichernamen (UUID + Endung) — niemals unter dem Original-Dateinamen.
 */

export type AnhangRow = Anhang;

export const MAX_ANHANG_BYTES = 10 * 1024 * 1024;

export const ERLAUBTE_MIME_TYPEN: readonly string[] = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Endung wird aus dem MIME-Typ abgeleitet (nie aus dem Original-Dateinamen)
const MIME_ENDUNGEN: Record<string, string> = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'text/plain': '.txt',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
};

function uploadDir(): string {
  return process.env.UPLOAD_DIR || './uploads';
}

/** Absoluter/relativer Pfad der Anhang-Datei auf der Platte. */
export function anhangPfad(row: Pick<AnhangRow, 'speicherName'>): string {
  return path.join(uploadDir(), row.speicherName);
}

/**
 * Validiert und speichert einen Anhang: Datei nach UPLOAD_DIR schreiben,
 * Metadaten-Zeile anlegen. Wirft bei ungültiger Größe oder ungültigem
 * MIME-Typ einen Error mit deutscher Meldung.
 */
export async function speichereAnhang({
  hinweisId,
  nachrichtId,
  datei,
  hochgeladenVon,
}: {
  hinweisId: number;
  nachrichtId?: number;
  datei: File;
  hochgeladenVon: string;
}): Promise<AnhangRow> {
  if (datei.size === 0) {
    throw new Error('Die Datei ist leer.');
  }
  if (datei.size > MAX_ANHANG_BYTES) {
    throw new Error('Die Datei ist zu groß (maximal 10 MB).');
  }
  if (!ERLAUBTE_MIME_TYPEN.includes(datei.type)) {
    throw new Error(
      'Dieser Dateityp ist nicht erlaubt. Erlaubt sind PDF, JPG, PNG, WebP, TXT, DOCX und XLSX.',
    );
  }

  const dir = uploadDir();
  await mkdir(dir, { recursive: true });

  const speicherName = randomUUID() + MIME_ENDUNGEN[datei.type];
  const buffer = Buffer.from(await datei.arrayBuffer());
  await writeFile(path.join(dir, speicherName), buffer);

  const [row] = await withTenant('all', (tx) =>
    tx
      .insert(anhaenge)
      .values({
        hinweisId,
        nachrichtId: nachrichtId ?? null,
        dateiname: datei.name,
        mimeTyp: datei.type,
        groesse: datei.size,
        speicherName,
        hochgeladenVon,
      })
      .returning(),
  );

  return row;
}

/**
 * Lädt einen Anhang unter Beachtung des Mandanten-Scopes: Der Join auf
 * hinweise greift über die RLS-Policy, zusätzlich Defense-in-Depth-Filter
 * auf hinweise.kundeId.
 */
export async function ladeAnhangMitScope(
  anhangId: number,
  scope: KundeScope,
): Promise<AnhangRow | null> {
  const bedingungen = [eq(anhaenge.id, anhangId)];
  if (scope !== 'all') {
    bedingungen.push(eq(hinweise.kundeId, scope));
  }

  const [row] = await withTenant(scope, (tx) =>
    tx
      .select(getTableColumns(anhaenge))
      .from(anhaenge)
      .innerJoin(hinweise, eq(anhaenge.hinweisId, hinweise.id))
      .where(and(...bedingungen))
      .limit(1),
  );

  return row ?? null;
}
