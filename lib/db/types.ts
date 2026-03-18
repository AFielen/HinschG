import type {
  users,
  kundengruppen,
  kunden,
  mitarbeiter,
  hinweise,
  aufgaben,
  archiv,
  emailKonten,
  emailVorlagen,
  emails,
} from './schema';

// ── Select Types (Daten aus der DB lesen) ──────────────────────────────────

export type User = typeof users.$inferSelect;
export type Kundengruppe = typeof kundengruppen.$inferSelect;
export type Kunde = typeof kunden.$inferSelect;
export type Mitarbeiter = typeof mitarbeiter.$inferSelect;
export type Hinweis = typeof hinweise.$inferSelect;
export type Aufgabe = typeof aufgaben.$inferSelect;
export type ArchivEintrag = typeof archiv.$inferSelect;
export type EmailKonto = typeof emailKonten.$inferSelect;
export type EmailVorlage = typeof emailVorlagen.$inferSelect;
export type Email = typeof emails.$inferSelect;

// ── Insert Types (Daten in die DB schreiben) ───────────────────────────────

export type NewUser = typeof users.$inferInsert;
export type NewKundengruppe = typeof kundengruppen.$inferInsert;
export type NewKunde = typeof kunden.$inferInsert;
export type NewMitarbeiter = typeof mitarbeiter.$inferInsert;
export type NewHinweis = typeof hinweise.$inferInsert;
export type NewAufgabe = typeof aufgaben.$inferInsert;
export type NewArchivEintrag = typeof archiv.$inferInsert;
export type NewEmailKonto = typeof emailKonten.$inferInsert;
export type NewEmailVorlage = typeof emailVorlagen.$inferInsert;
export type NewEmail = typeof emails.$inferInsert;
