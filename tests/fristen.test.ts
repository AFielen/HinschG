import { describe, expect, it } from 'vitest';
import {
  berechneFristen,
  berechneLoeschdatum,
  LOESCHFRIST_JAHRE,
} from '@/lib/fristen';

describe('lib/fristen', () => {
  it('Eingangsbestätigung: exakt +7 Tage', () => {
    const eingang = new Date(2026, 2, 10, 14, 30); // 10.03.2026 14:30
    const { eingangsbestaetigungFaelligAm } = berechneFristen(eingang);
    expect(eingangsbestaetigungFaelligAm).toEqual(new Date(2026, 2, 17, 14, 30));
  });

  it('Eingangsbestätigung: +7 Tage über Monatsgrenze', () => {
    const eingang = new Date(2026, 0, 28); // 28.01.2026
    const { eingangsbestaetigungFaelligAm } = berechneFristen(eingang);
    expect(eingangsbestaetigungFaelligAm).toEqual(new Date(2026, 1, 4)); // 04.02.2026
  });

  it('Rückmeldung: +3 Monate im Normalfall', () => {
    const eingang = new Date(2026, 3, 15); // 15.04.2026
    const { rueckmeldungFaelligAm } = berechneFristen(eingang);
    expect(rueckmeldungFaelligAm).toEqual(new Date(2026, 6, 15)); // 15.07.2026
  });

  it('Rückmeldung Monatsende: 30.11. + 3 Monate endet am 28.02. (Monatsende-Klemmung, § 188 Abs. 3 BGB analog)', () => {
    // Den 30.02. gibt es nicht — die Frist endet am letzten Tag des
    // Zielmonats. Ein Datums-Überlauf auf den 02.03. würde eine zu späte
    // Frist anzeigen und die gesetzliche Frist reißen lassen.
    const eingang = new Date(2025, 10, 30); // 30.11.2025
    const { rueckmeldungFaelligAm } = berechneFristen(eingang);
    expect(rueckmeldungFaelligAm).toEqual(new Date(2026, 1, 28)); // 28.02.2026
  });

  it('Rückmeldung Monatsende: 31.01. + 3 Monate endet am 30.04. (kein Überlauf auf 01.05.)', () => {
    const eingang = new Date(2026, 0, 31); // 31.01.2026
    const { rueckmeldungFaelligAm } = berechneFristen(eingang);
    expect(rueckmeldungFaelligAm).toEqual(new Date(2026, 3, 30)); // 30.04.2026
  });

  it('Löschdatum: +3 Jahre nach Abschluss', () => {
    expect(LOESCHFRIST_JAHRE).toBe(3);
    const abschluss = new Date(2026, 5, 15); // 15.06.2026
    expect(berechneLoeschdatum(abschluss)).toEqual(new Date(2029, 5, 15));
  });

  it('Löschdatum Schaltjahr: 29.02. + 3 Jahre endet am 28.02. (Zieljahr kein Schaltjahr, Klemmung)', () => {
    const abschluss = new Date(2024, 1, 29); // 29.02.2024
    expect(berechneLoeschdatum(abschluss)).toEqual(new Date(2027, 1, 28)); // 28.02.2027
  });
});
