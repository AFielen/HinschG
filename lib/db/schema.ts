import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  boolean,
  integer,
  date,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

export const anredeEnum = pgEnum('anrede', ['Frau', 'Herr']);

export const hinweisStatusEnum = pgEnum('hinweis_status', [
  'Neu',
  'InBearbeitung',
  'Abgeschlossen',
]);

export const meldewegEnum = pgEnum('meldeweg', [
  'Hinweisgebersystem',
  'Telefon',
  'Email',
  'Post',
]);

export const aufgabeStatusEnum = pgEnum('aufgabe_status', [
  'Offen',
  'InBearbeitung',
  'Abgeschlossen',
]);

export const archivArtEnum = pgEnum('archiv_art', [
  'Kommunikation',
  'Mail',
  'Log',
]);

export const emailRichtungEnum = pgEnum('email_richtung', [
  'Eingang',
  'Ausgang',
]);

export const emailStatusEnum = pgEnum('email_status', [
  'Gesendet',
  'Warteschlange',
  'Fehler',
]);

export const nachrichtRichtungEnum = pgEnum('nachricht_richtung', [
  'AnHinweisgeber',
  'VonHinweisgeber',
]);

// ── Timestamps (wiederverwendbar) ──────────────────────────────────────────

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
};

// ── Users ──────────────────────────────────────────────────────────────────

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 255 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    displayName: varchar('display_name', { length: 255 }),
    email: varchar('email', { length: 255 }),
    role: userRoleEnum('role').default('user').notNull(),
    active: boolean('active').default(true).notNull(),
    // null = zentraler Zugriff auf alle Mandanten
    kundeId: integer('kunde_id').references(() => kunden.id),
    ...timestamps,
  },
  (table) => [index('users_username_idx').on(table.username)],
);

// ── Kundengruppen ──────────────────────────────────────────────────────────

export const kundengruppen = pgTable('kundengruppen', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
});

// ── Kunden ─────────────────────────────────────────────────────────────────

export const kunden = pgTable(
  'kunden',
  {
    id: serial('id').primaryKey(),
    firma: varchar('firma', { length: 255 }).notNull(),
    strasse: varchar('strasse', { length: 255 }).notNull(),
    plz: varchar('plz', { length: 10 }).notNull(),
    ort: varchar('ort', { length: 255 }).notNull(),
    telefon: varchar('telefon', { length: 50 }).notNull(),
    telefax: varchar('telefax', { length: 50 }),
    firmenEmail: varchar('firmen_email', { length: 255 }).notNull(),

    logoName: varchar('logo_name', { length: 255 }),
    logoUrl: varchar('logo_url', { length: 500 }),

    kundengruppeId: integer('kundengruppe_id').references(
      () => kundengruppen.id,
    ),
    kundenKuerzel: varchar('kunden_kuerzel', { length: 50 }),
    kundenIdDisplay: serial('kunden_id_display'),
    aboModell: varchar('abo_modell', { length: 100 }),

    meldestelleEmail: varchar('meldestelle_email', { length: 255 }).notNull(),
    ansprechpartner: varchar('ansprechpartner', { length: 255 }),
    meldestelleStrasse: varchar('meldestelle_strasse', { length: 255 }),
    meldestellePlz: varchar('meldestelle_plz', { length: 10 }),
    meldestelleOrt: varchar('meldestelle_ort', { length: 255 }),
    meldestelleInternetseite: varchar('meldestelle_internetseite', {
      length: 500,
    }),
    meldestelleEmailPublic: varchar('meldestelle_email_public', {
      length: 255,
    }),
    meldestelleTelefonPublic: varchar('meldestelle_telefon_public', {
      length: 50,
    }),
    linkImpressum: varchar('link_impressum', { length: 500 }),
    linkDatenschutz: varchar('link_datenschutz', { length: 500 }),

    ...timestamps,
  },
  (table) => [
    index('kunden_kundengruppe_id_idx').on(table.kundengruppeId),
    index('kunden_kuerzel_idx').on(table.kundenKuerzel),
  ],
);

// ── Mitarbeiter ────────────────────────────────────────────────────────────

export const mitarbeiter = pgTable(
  'mitarbeiter',
  {
    id: serial('id').primaryKey(),
    kundeId: integer('kunde_id')
      .references(() => kunden.id)
      .notNull(),
    anrede: anredeEnum('anrede'),
    vorname: varchar('vorname', { length: 255 }),
    nachname: varchar('nachname', { length: 255 }),
    email1: varchar('email1', { length: 255 }),
    email2: varchar('email2', { length: 255 }),
    telefon: varchar('telefon', { length: 50 }),
    mobil: varchar('mobil', { length: 50 }),
    anschrift: varchar('anschrift', { length: 500 }),
    funktion: varchar('funktion', { length: 255 }),
    istMeldestelle: boolean('ist_meldestelle').default(false).notNull(),
    istGeschaeftsfuehrer: boolean('ist_geschaeftsfuehrer')
      .default(false)
      .notNull(),
    ...timestamps,
  },
  (table) => [index('mitarbeiter_kunde_id_idx').on(table.kundeId)],
);

// ── Hinweise ───────────────────────────────────────────────────────────────

export const hinweise = pgTable(
  'hinweise',
  {
    id: serial('id').primaryKey(),
    aktenzeichen: varchar('aktenzeichen', { length: 50 }).unique().notNull(),
    status: hinweisStatusEnum('status').default('Neu').notNull(),

    istAnonym: boolean('ist_anonym').default(false).notNull(),
    kundeId: integer('kunde_id')
      .references(() => kunden.id)
      .notNull(),
    meldeweg: meldewegEnum('meldeweg'),

    kategorie: varchar('kategorie', { length: 255 }),
    datumVerstoss: date('datum_verstoss'),
    beteiligte: text('beteiligte'),
    meldungstext: text('meldungstext'),

    // Hinweisgeber-PII: verschlüsselt gespeichert (lib/crypto.ts, AES-256-GCM)
    hinweisgeberAnrede: anredeEnum('hinweisgeber_anrede'),
    hinweisgeberVorname: text('hinweisgeber_vorname'),
    hinweisgeberNachname: text('hinweisgeber_nachname'),
    hinweisgeberTelefon: text('hinweisgeber_telefon'),
    hinweisgeberEmail: text('hinweisgeber_email'),
    hinweisgeberAnmerkungen: text('hinweisgeber_anmerkungen'),

    // Postfach-Zugang (bcrypt-Hash des Zugangscodes)
    zugangscodeHash: text('zugangscode_hash'),

    // Fristen nach HinSchG
    eingangsbestaetigungAm: timestamp('eingangsbestaetigung_am', {
      withTimezone: true,
    }),
    eingangsbestaetigungFaelligAm: timestamp('eingangsbestaetigung_faellig_am', {
      withTimezone: true,
    }),
    rueckmeldungAm: timestamp('rueckmeldung_am', { withTimezone: true }),
    rueckmeldungFaelligAm: timestamp('rueckmeldung_faellig_am', {
      withTimezone: true,
    }),
    abgeschlossenAm: timestamp('abgeschlossen_am', { withTimezone: true }),
    loeschenAm: timestamp('loeschen_am', { withTimezone: true }),
    fristErinnerungAm: timestamp('frist_erinnerung_am', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    index('hinweise_kunde_id_idx').on(table.kundeId),
    index('hinweise_status_idx').on(table.status),
    index('hinweise_aktenzeichen_idx').on(table.aktenzeichen),
  ],
);

// ── Aufgaben ───────────────────────────────────────────────────────────────

export const aufgaben = pgTable(
  'aufgaben',
  {
    id: serial('id').primaryKey(),
    hinweisId: integer('hinweis_id')
      .references(() => hinweise.id)
      .notNull(),
    titel: varchar('titel', { length: 255 }).notNull(),
    beschreibung: text('beschreibung'),

    status: aufgabeStatusEnum('status').default('Offen').notNull(),

    schritt: integer('schritt').default(1).notNull(),
    schrittName: varchar('schritt_name', { length: 255 }),

    bearbeiterId: integer('bearbeiter_id').references(() => users.id),
    faelligBis: timestamp('faellig_bis', { withTimezone: true }),
    startDatum: timestamp('start_datum', { withTimezone: true }),
    erledigtAm: timestamp('erledigt_am', { withTimezone: true }),

    ...timestamps,
  },
  (table) => [
    index('aufgaben_hinweis_id_idx').on(table.hinweisId),
    index('aufgaben_bearbeiter_id_idx').on(table.bearbeiterId),
    index('aufgaben_status_idx').on(table.status),
  ],
);

// ── Archiv ─────────────────────────────────────────────────────────────────

export const archiv = pgTable(
  'archiv',
  {
    id: serial('id').primaryKey(),
    hinweisId: integer('hinweis_id')
      .references(() => hinweise.id)
      .notNull(),
    art: archivArtEnum('art').notNull(),
    ersteller: varchar('ersteller', { length: 255 }),
    meldung: text('meldung'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('archiv_hinweis_id_idx').on(table.hinweisId)],
);

// ── Email-Konten ───────────────────────────────────────────────────────────

export const emailKonten = pgTable('email_konten', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  smtpHost: varchar('smtp_host', { length: 255 }),
  smtpPort: integer('smtp_port'),
  smtpUser: varchar('smtp_user', { length: 255 }),
  smtpPassEncrypted: varchar('smtp_pass_encrypted', { length: 500 }),
  active: boolean('active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Email-Vorlagen ─────────────────────────────────────────────────────────

export const emailVorlagen = pgTable('email_vorlagen', {
  id: serial('id').primaryKey(),
  templateName: varchar('template_name', { length: 255 }),
  fromName: varchar('from_name', { length: 255 }),
  subject: varchar('subject', { length: 500 }),
  htmlContent: text('html_content'),
  hasAttachment: boolean('has_attachment').default(false).notNull(),
  ...timestamps,
});

// ── Emails ─────────────────────────────────────────────────────────────────

export const emails = pgTable(
  'emails',
  {
    id: serial('id').primaryKey(),
    kontoId: integer('konto_id').references(() => emailKonten.id),
    richtung: emailRichtungEnum('richtung').notNull(),
    von: varchar('von', { length: 255 }),
    an: varchar('an', { length: 255 }),
    betreff: varchar('betreff', { length: 500 }),
    inhalt: text('inhalt'),
    status: emailStatusEnum('status').notNull(),
    hinweisId: integer('hinweis_id').references(() => hinweise.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('emails_konto_id_idx').on(table.kontoId),
    index('emails_hinweis_id_idx').on(table.hinweisId),
  ],
);

// ── Nachrichten (Postfach-Kommunikation mit Hinweisgeber) ──────────────────

export const nachrichten = pgTable(
  'nachrichten',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    hinweisId: integer('hinweis_id')
      .references(() => hinweise.id)
      .notNull(),
    richtung: nachrichtRichtungEnum('richtung').notNull(),
    inhalt: text('inhalt').notNull(),
    ersteller: text('ersteller').notNull(),
    gelesenAm: timestamp('gelesen_am', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('nachrichten_hinweis_id_idx').on(table.hinweisId)],
);

// ── Anhänge (Datei-Uploads zu Hinweisen) ───────────────────────────────────

export const anhaenge = pgTable(
  'anhaenge',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    hinweisId: integer('hinweis_id')
      .references(() => hinweise.id)
      .notNull(),
    nachrichtId: integer('nachricht_id').references(() => nachrichten.id),
    dateiname: text('dateiname').notNull(),
    mimeTyp: text('mime_typ').notNull(),
    groesse: integer('groesse').notNull(),
    // Dateiname auf der Platte (UUID + Endung), niemals der Original-Name
    speicherName: text('speicher_name').unique().notNull(),
    hochgeladenVon: text('hochgeladen_von').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('anhaenge_hinweis_id_idx').on(table.hinweisId)],
);

// ── Löschprotokoll (§ 11 Abs. 5 HinSchG – KEIN Fallinhalt) ─────────────────

export const loeschprotokoll = pgTable('loeschprotokoll', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  aktenzeichen: text('aktenzeichen').notNull(),
  kundeId: integer('kunde_id'),
  grund: text('grund').notNull(),
  meldungEingegangenAm: timestamp('meldung_eingegangen_am', {
    withTimezone: true,
  }),
  abgeschlossenAm: timestamp('abgeschlossen_am', { withTimezone: true }),
  geloeschtAm: timestamp('geloescht_am', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── System-Protokoll ───────────────────────────────────────────────────────

export const systemProtokoll = pgTable('system_protokoll', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
  ereignis: text('ereignis').notNull(),
  benutzer: text('benutzer'),
  details: text('details'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ── Relations ──────────────────────────────────────────────────────────────

export const kundengruppenRelations = relations(kundengruppen, ({ many }) => ({
  kunden: many(kunden),
}));

export const kundenRelations = relations(kunden, ({ one, many }) => ({
  kundengruppe: one(kundengruppen, {
    fields: [kunden.kundengruppeId],
    references: [kundengruppen.id],
  }),
  mitarbeiter: many(mitarbeiter),
  hinweise: many(hinweise),
}));

export const mitarbeiterRelations = relations(mitarbeiter, ({ one }) => ({
  kunde: one(kunden, {
    fields: [mitarbeiter.kundeId],
    references: [kunden.id],
  }),
}));

export const hinweiseRelations = relations(hinweise, ({ one, many }) => ({
  kunde: one(kunden, {
    fields: [hinweise.kundeId],
    references: [kunden.id],
  }),
  aufgaben: many(aufgaben),
  archivEintraege: many(archiv),
  emails: many(emails),
  nachrichten: many(nachrichten),
  anhaenge: many(anhaenge),
}));

export const anhaengeRelations = relations(anhaenge, ({ one }) => ({
  hinweis: one(hinweise, {
    fields: [anhaenge.hinweisId],
    references: [hinweise.id],
  }),
}));

export const nachrichtenRelations = relations(nachrichten, ({ one }) => ({
  hinweis: one(hinweise, {
    fields: [nachrichten.hinweisId],
    references: [hinweise.id],
  }),
}));

export const aufgabenRelations = relations(aufgaben, ({ one }) => ({
  hinweis: one(hinweise, {
    fields: [aufgaben.hinweisId],
    references: [hinweise.id],
  }),
  bearbeiter: one(users, {
    fields: [aufgaben.bearbeiterId],
    references: [users.id],
  }),
}));

export const archivRelations = relations(archiv, ({ one }) => ({
  hinweis: one(hinweise, {
    fields: [archiv.hinweisId],
    references: [hinweise.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  aufgaben: many(aufgaben),
  kunde: one(kunden, {
    fields: [users.kundeId],
    references: [kunden.id],
  }),
}));

export const emailKontenRelations = relations(emailKonten, ({ many }) => ({
  emails: many(emails),
}));

export const emailsRelations = relations(emails, ({ one }) => ({
  konto: one(emailKonten, {
    fields: [emails.kontoId],
    references: [emailKonten.id],
  }),
  hinweis: one(hinweise, {
    fields: [emails.hinweisId],
    references: [hinweise.id],
  }),
}));
