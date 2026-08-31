/**
 * Fristberechnung nach HinSchG.
 *
 * - Eingangsbestätigung: spätestens 7 Tage nach Eingang (§ 17 Abs. 1 HinSchG)
 * - Rückmeldung: spätestens 3 Monate nach Eingang (§ 17 Abs. 2 HinSchG)
 * - Löschung: 3 Jahre nach Abschluss (§ 11 Abs. 5 HinSchG)
 *
 * Monats- und Jahresfristen enden analog § 188 Abs. 3 BGB am letzten Tag des
 * Zielmonats, wenn der Ausgangstag dort nicht existiert (31.01. + 3 Monate →
 * 30.04., nicht 01.05.). Ein Datums-Überlauf würde eine zu späte Frist
 * anzeigen und die gesetzliche Frist reißen lassen.
 */

export const LOESCHFRIST_JAHRE = 3;
export const RUECKMELDUNG_ERINNERUNG_TAGE = 14;

function addiereMonateMitMonatsende(datum: Date, monate: number): Date {
  const ergebnis = new Date(datum);
  const tag = ergebnis.getDate();
  ergebnis.setDate(1);
  ergebnis.setMonth(ergebnis.getMonth() + monate);
  const letzterTagImZielmonat = new Date(
    ergebnis.getFullYear(),
    ergebnis.getMonth() + 1,
    0,
  ).getDate();
  ergebnis.setDate(Math.min(tag, letzterTagImZielmonat));
  return ergebnis;
}

export function berechneFristen(eingang: Date): {
  eingangsbestaetigungFaelligAm: Date;
  rueckmeldungFaelligAm: Date;
} {
  const eingangsbestaetigungFaelligAm = new Date(eingang);
  eingangsbestaetigungFaelligAm.setDate(
    eingangsbestaetigungFaelligAm.getDate() + 7,
  );

  return {
    eingangsbestaetigungFaelligAm,
    rueckmeldungFaelligAm: addiereMonateMitMonatsende(eingang, 3),
  };
}

export function berechneLoeschdatum(abschluss: Date): Date {
  return addiereMonateMitMonatsende(abschluss, LOESCHFRIST_JAHRE * 12);
}
