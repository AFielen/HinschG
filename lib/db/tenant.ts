import { sql } from 'drizzle-orm';
import { db } from './index';

/**
 * Mandantentrennung über Row Level Security.
 *
 * Die Tabellen hinweise und mitarbeiter haben FORCE ROW LEVEL SECURITY mit
 * einer Policy auf current_setting('app.kunde_ids'). Ohne gesetzten Scope
 * liefert jede Query 0 Zeilen (fail-closed) — deshalb MUSS jeder Zugriff
 * auf diese Tabellen über withTenant() laufen.
 */

export type KundeScope = 'all' | number;

/**
 * Ermittelt den Mandanten-Scope einer Session:
 * 'all' für Admins und zentrale Benutzer (kundeId null), sonst die kundeId.
 *
 * Fail-closed: Eine Session ohne gültige Rolle darf niemals 'all' erhalten
 * (Defense in Depth gegen manipulierte/fremde Tokens). verifyToken lehnt
 * solche Tokens bereits ab; diese Prüfung ist die zweite Verteidigungslinie.
 */
export function kundeScopeOf(session: {
  role: string;
  kundeId: number | null;
}): KundeScope {
  if (session.role !== 'admin' && session.role !== 'user') {
    throw new Error('Ungültige Rolle für Mandanten-Scope');
  }
  if (session.role === 'admin' || session.kundeId === null) {
    return 'all';
  }
  return session.kundeId;
}

/**
 * Führt fn in einer Transaktion aus, in der app.kunde_ids per SET LOCAL
 * (set_config mit is_local=true) auf den Scope gesetzt ist.
 */
export async function withTenant<T>(
  scope: KundeScope,
  fn: (tx: typeof db) => Promise<T>,
): Promise<T> {
  const value = scope === 'all' ? 'all' : String(scope);
  return db.transaction(async (tx) => {
    // Entspricht SET LOCAL app.kunde_ids = '<scope>' (gilt nur für diese Transaktion)
    await tx.execute(
      sql`SELECT set_config('app.kunde_ids', ${value}, true)`,
    );
    return fn(tx as unknown as typeof db);
  });
}
