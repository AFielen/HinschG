import { beforeAll, describe, expect, it } from 'vitest';
import { decryptField, encryptField } from '@/lib/crypto';

describe('lib/crypto', () => {
  beforeAll(() => {
    // 32 Byte Testschlüssel, Base64-kodiert
    process.env.ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  });

  it('Roundtrip: encrypt → decrypt liefert den Klartext', () => {
    const klartext = 'Max Mustermann <max@example.org> — Umlaute äöüß';
    const ct = encryptField(klartext);
    expect(ct).not.toBeNull();
    expect(ct).not.toBe(klartext);
    expect(ct!.startsWith('v1:')).toBe(true);
    expect(decryptField(ct)).toBe(klartext);
  });

  it('null / undefined / leerer String → null beim Verschlüsseln', () => {
    expect(encryptField(null)).toBeNull();
    expect(encryptField(undefined)).toBeNull();
    expect(encryptField('')).toBeNull();
  });

  it('decryptField(null) → null', () => {
    expect(decryptField(null)).toBeNull();
  });

  it('Plaintext-Passthrough: Wert ohne v1:-Präfix kommt unverändert zurück', () => {
    expect(decryptField('altbestand-klartext')).toBe('altbestand-klartext');
    expect(decryptField('')).toBe('');
  });

  it('zwei Verschlüsselungen desselben Klartexts ergeben verschiedene Ciphertexte (IV)', () => {
    const a = encryptField('gleicher Klartext');
    const b = encryptField('gleicher Klartext');
    expect(a).not.toBeNull();
    expect(b).not.toBeNull();
    expect(a).not.toBe(b);
    // beide entschlüsseln trotzdem zum selben Wert
    expect(decryptField(a)).toBe('gleicher Klartext');
    expect(decryptField(b)).toBe('gleicher Klartext');
  });

  it('manipulierter Ciphertext wirft', () => {
    const ct = encryptField('sensible Daten')!;
    const parts = ct.slice('v1:'.length).split(':');
    // Ciphertext-Teil manipulieren (erstes Zeichen kippen)
    const ctB64 = parts[2];
    const flipped = (ctB64[0] === 'A' ? 'B' : 'A') + ctB64.slice(1);
    const manipuliert = `v1:${parts[0]}:${parts[1]}:${flipped}`;
    expect(() => decryptField(manipuliert)).toThrow();
  });

  it('ungültiges Format (falsche Teilanzahl) wirft', () => {
    expect(() => decryptField('v1:nur-ein-teil')).toThrow();
  });
});
