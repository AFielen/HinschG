CREATE TYPE "public"."nachricht_richtung" AS ENUM('AnHinweisgeber', 'VonHinweisgeber');--> statement-breakpoint
CREATE TABLE "loeschprotokoll" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "loeschprotokoll_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"aktenzeichen" text NOT NULL,
	"kunde_id" integer,
	"grund" text NOT NULL,
	"meldung_eingegangen_am" timestamp with time zone,
	"abgeschlossen_am" timestamp with time zone,
	"geloescht_am" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nachrichten" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "nachrichten_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hinweis_id" integer NOT NULL,
	"richtung" "nachricht_richtung" NOT NULL,
	"inhalt" text NOT NULL,
	"ersteller" text NOT NULL,
	"gelesen_am" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_protokoll" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "system_protokoll_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"ereignis" text NOT NULL,
	"benutzer" text,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hinweise" ALTER COLUMN "hinweisgeber_vorname" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hinweise" ALTER COLUMN "hinweisgeber_nachname" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hinweise" ALTER COLUMN "hinweisgeber_telefon" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hinweise" ALTER COLUMN "hinweisgeber_email" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "zugangscode_hash" text;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "eingangsbestaetigung_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "eingangsbestaetigung_faellig_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "rueckmeldung_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "rueckmeldung_faellig_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "abgeschlossen_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "loeschen_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hinweise" ADD COLUMN "frist_erinnerung_am" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kunde_id" integer;--> statement-breakpoint
ALTER TABLE "nachrichten" ADD CONSTRAINT "nachrichten_hinweis_id_hinweise_id_fk" FOREIGN KEY ("hinweis_id") REFERENCES "public"."hinweise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "nachrichten_hinweis_id_idx" ON "nachrichten" USING btree ("hinweis_id");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_kunde_id_kunden_id_fk" FOREIGN KEY ("kunde_id") REFERENCES "public"."kunden"("id") ON DELETE no action ON UPDATE no action;