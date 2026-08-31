import { unlink } from 'fs/promises';
import { eq } from 'drizzle-orm';
import {
  hinweise,
  nachrichten,
  aufgaben,
  archiv,
  emails,
  anhaenge,
  loeschprotokoll,
} from './db/schema';
import { withTenant } from './db/tenant';
import { anhangPfad } from './anhaenge';

/**
 * Löscht einen Hinweis vollständig (§ 11 Abs. 5 HinSchG) und hinterlässt
 * nur einen inhaltsfreien Eintrag im Löschprotokoll. Anhänge werden
 * mitgelöscht — die Datenbank-Zeilen in der Transaktion, die Dateien auf
 * der Platte nach erfolgreichem Commit.
 *
 * @returns false, wenn der Hinweis nicht existiert.
 */
export async function loescheHinweis(
  hinweisId: number,
  grund: string,
): Promise<boolean> {
  const anhangDateien = await withTenant('all', async (tx) => {
    const [hinweis] = await tx
      .select()
      .from(hinweise)
      .where(eq(hinweise.id, hinweisId))
      .limit(1);

    if (!hinweis) return null;

    const anhangZeilen = await tx
      .select({ speicherName: anhaenge.speicherName })
      .from(anhaenge)
      .where(eq(anhaenge.hinweisId, hinweisId));

    await tx.insert(loeschprotokoll).values({
      aktenzeichen: hinweis.aktenzeichen,
      kundeId: hinweis.kundeId,
      grund,
      meldungEingegangenAm: hinweis.createdAt,
      abgeschlossenAm: hinweis.abgeschlossenAm,
    });

    // Anhänge VOR den Nachrichten löschen (FK anhaenge.nachricht_id)
    await tx.delete(anhaenge).where(eq(anhaenge.hinweisId, hinweisId));
    await tx.delete(emails).where(eq(emails.hinweisId, hinweisId));
    await tx.delete(nachrichten).where(eq(nachrichten.hinweisId, hinweisId));
    await tx.delete(aufgaben).where(eq(aufgaben.hinweisId, hinweisId));
    await tx.delete(archiv).where(eq(archiv.hinweisId, hinweisId));
    await tx.delete(hinweise).where(eq(hinweise.id, hinweisId));

    return anhangZeilen;
  });

  if (anhangDateien === null) return false;

  // Dateien erst nach erfolgreichem Commit von der Platte entfernen
  for (const zeile of anhangDateien) {
    try {
      await unlink(anhangPfad(zeile));
    } catch (err) {
      // Fehlende Datei ist unkritisch (z. B. bereits gelöscht) — nur loggen
      console.error(
        `[Löschung] Anhang-Datei ${zeile.speicherName} konnte nicht gelöscht werden:`,
        err,
      );
    }
  }

  return true;
}
