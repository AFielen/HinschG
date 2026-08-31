import { describe, expect, it } from 'vitest';
import {
  generateAktenzeichen,
  generateZugangscode,
} from '@/lib/aktenzeichen';

// Alphabet ohne verwechselbare Zeichen (kein I, O, 0, 1)
const ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

describe('lib/aktenzeichen', () => {
  it('Aktenzeichen hat Format YYYY-MM-DD-XXXXXXXX', () => {
    const az = generateAktenzeichen();
    expect(az).toMatch(/^\d{4}-\d{2}-\d{2}-[A-HJ-NP-Z2-9]{8}$/);

    // Datumsteil entspricht dem heutigen Datum (lokal)
    const now = new Date();
    const heute = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(az.startsWith(heute + '-')).toBe(true);
  });

  it('Zufallsteil nutzt nur das erlaubte Alphabet (kein I/O/0/1)', () => {
    for (let i = 0; i < 50; i++) {
      const suffix = generateAktenzeichen().slice(-8);
      for (const c of suffix) {
        expect(ZEICHEN).toContain(c);
      }
      expect(suffix).not.toMatch(/[IO01]/);
    }
  });

  it('1000 Codes ohne Duplikat', () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateZugangscode());
    }
    expect(codes.size).toBe(1000);
  });

  it('Zugangscode hat Format 4×5 Zeichen mit Bindestrichen', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateZugangscode();
      expect(code).toMatch(
        /^[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}-[A-HJ-NP-Z2-9]{5}$/,
      );
      expect(code).toHaveLength(23);
    }
  });
});
