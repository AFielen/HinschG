import { eq } from 'drizzle-orm';
import {
  hinweise,
  nachrichten,
  aufgaben,
  archiv,
  emails,
  loeschprotokoll,
} from './db/schema';
import { withTenant } from './db/tenant';

/**
 * Löscht einen Hinweis vollständig (§ 11 Abs. 5 HinSchG) und hinterlässt
 * nur einen inhaltsfreien Eintrag im Löschprotokoll.
 *
 * @returns false, wenn der Hinweis nicht existiert.
 */
export async function loescheHinweis(
  hinweisId: number,
  grund: string,
): Promise<boolean> {
  return withTenant('all', async (tx) => {
    const [hinweis] = await tx
      .select()
      .from(hinweise)
      .where(eq(hinweise.id, hinweisId))
      .limit(1);

    if (!hinweis) return false;

    await tx.insert(loeschprotokoll).values({
      aktenzeichen: hinweis.aktenzeichen,
      kundeId: hinweis.kundeId,
      grund,
      meldungEingegangenAm: hinweis.createdAt,
      abgeschlossenAm: hinweis.abgeschlossenAm,
    });

    await tx.delete(emails).where(eq(emails.hinweisId, hinweisId));
    await tx.delete(nachrichten).where(eq(nachrichten.hinweisId, hinweisId));
    await tx.delete(aufgaben).where(eq(aufgaben.hinweisId, hinweisId));
    await tx.delete(archiv).where(eq(archiv.hinweisId, hinweisId));
    await tx.delete(hinweise).where(eq(hinweise.id, hinweisId));

    return true;
  });
}
