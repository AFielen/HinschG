/**
 * Zentrale Liste der Meldungs-Kategorien (identisch zu den Wizard-Seiten
 * unter app/meldestelle). Serverseitige Validierung über istGueltigeKategorie.
 */
export const KATEGORIEN: readonly string[] = [
  'Sexuelle Belästigung',
  'Diskriminierung',
  'Betrug / Untreue',
  'Korruption / Bestechung',
  'Datenschutzverstöße',
  'Arbeitsschutzverstöße',
  'Umweltverstöße',
  'Geldwäsche',
  'Steuerhinterziehung',
  'Verstöße gegen Vergaberecht',
  'Sonstige Verstöße',
];

export function istGueltigeKategorie(k: string): boolean {
  return KATEGORIEN.includes(k);
}
