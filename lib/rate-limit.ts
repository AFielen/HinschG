/**
 * Einfacher In-Memory-Rate-Limiter (Sliding Window).
 *
 * Bewusst In-Memory gehalten: Die App läuft als einzelner Container,
 * daher ist keine verteilte Lösung (Redis o. Ä.) nötig. IP-Adressen
 * werden NICHT persistiert (Datenschutz) — alle Einträge liegen nur im
 * Prozessspeicher und werden beim Zugriff aufgeräumt, sobald ihr
 * Zeitfenster abgelaufen ist. Ein Neustart setzt die Zähler zurück.
 */

// key → Ablaufzeitpunkte (ms) der einzelnen Treffer
const buckets = new Map<string, number[]>();

export function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();

  // Alte Einträge beim Zugriff aufräumen (alle Keys)
  for (const [k, expiries] of buckets) {
    const alive = expiries.filter((t) => t > now);
    if (alive.length === 0) {
      buckets.delete(k);
    } else if (alive.length !== expiries.length) {
      buckets.set(k, alive);
    }
  }

  const entries = buckets.get(key) ?? [];

  if (entries.length >= opts.limit) {
    const naechsterAblauf = Math.min(...entries);
    return {
      ok: false,
      retryAfterSeconds: Math.max(1, Math.ceil((naechsterAblauf - now) / 1000)),
    };
  }

  entries.push(now + opts.windowMs);
  buckets.set(key, entries);

  return { ok: true, retryAfterSeconds: 0 };
}
