/**
 * Fristberechnung nach HinSchG.
 *
 * - Eingangsbestätigung: spätestens 7 Tage nach Eingang (§ 17 Abs. 1 HinSchG)
 * - Rückmeldung: spätestens 3 Monate nach Eingang (§ 17 Abs. 2 HinSchG)
 * - Löschung: 3 Jahre nach Abschluss (§ 11 Abs. 5 HinSchG)
 */

export const LOESCHFRIST_JAHRE = 3;
export const RUECKMELDUNG_ERINNERUNG_TAGE = 14;

export function berechneFristen(eingang: Date): {
  eingangsbestaetigungFaelligAm: Date;
  rueckmeldungFaelligAm: Date;
} {
  const eingangsbestaetigungFaelligAm = new Date(eingang);
  eingangsbestaetigungFaelligAm.setDate(
    eingangsbestaetigungFaelligAm.getDate() + 7,
  );

  const rueckmeldungFaelligAm = new Date(eingang);
  rueckmeldungFaelligAm.setMonth(rueckmeldungFaelligAm.getMonth() + 3);

  return { eingangsbestaetigungFaelligAm, rueckmeldungFaelligAm };
}

export function berechneLoeschdatum(abschluss: Date): Date {
  const loeschdatum = new Date(abschluss);
  loeschdatum.setFullYear(loeschdatum.getFullYear() + LOESCHFRIST_JAHRE);
  return loeschdatum;
}
