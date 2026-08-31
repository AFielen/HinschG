import { describe, expect, it } from 'vitest';
import { istGueltigeKategorie, KATEGORIEN } from '@/lib/kategorien';

describe('lib/kategorien', () => {
  it('enthält genau 11 Kategorien', () => {
    expect(KATEGORIEN).toHaveLength(11);
    // keine Duplikate
    expect(new Set(KATEGORIEN).size).toBe(11);
  });

  it('istGueltigeKategorie: alle definierten Kategorien sind gültig', () => {
    for (const k of KATEGORIEN) {
      expect(istGueltigeKategorie(k)).toBe(true);
    }
    expect(istGueltigeKategorie('Sexuelle Belästigung')).toBe(true);
    expect(istGueltigeKategorie('Sonstige Verstöße')).toBe(true);
  });

  it('istGueltigeKategorie: unbekannte oder abweichende Werte sind ungültig', () => {
    expect(istGueltigeKategorie('')).toBe(false);
    expect(istGueltigeKategorie('Unbekannt')).toBe(false);
    expect(istGueltigeKategorie('sexuelle belästigung')).toBe(false); // case-sensitiv
    expect(istGueltigeKategorie('Betrug')).toBe(false); // nur exakter Wortlaut
  });
});
