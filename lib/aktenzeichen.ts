import { randomInt } from 'node:crypto';

/**
 * Aktenzeichen und Zugangscodes für das Hinweisgebersystem.
 *
 * Alphabet ohne verwechselbare Zeichen (kein I, O, 0, 1).
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomChars(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += ALPHABET[randomInt(ALPHABET.length)];
  }
  return result;
}

/**
 * Erzeugt ein Aktenzeichen im Format 'YYYY-MM-DD-XXXXXXXX'.
 */
export function generateAktenzeichen(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}-${randomChars(8)}`;
}

/**
 * Erzeugt einen Zugangscode aus 4 Gruppen à 5 Zeichen
 * (z.B. ABCDE-FGHJK-LMNPQ-RSTUV, ~100 Bit Entropie).
 */
export function generateZugangscode(): string {
  return [
    randomChars(5),
    randomChars(5),
    randomChars(5),
    randomChars(5),
  ].join('-');
}
