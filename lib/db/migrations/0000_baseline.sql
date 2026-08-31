CREATE TYPE "public"."anrede" AS ENUM('Frau', 'Herr');--> statement-breakpoint
CREATE TYPE "public"."archiv_art" AS ENUM('Kommunikation', 'Mail', 'Log');--> statement-breakpoint
CREATE TYPE "public"."aufgabe_status" AS ENUM('Offen', 'InBearbeitung', 'Abgeschlossen');--> statement-breakpoint
CREATE TYPE "public"."email_richtung" AS ENUM('Eingang', 'Ausgang');--> statement-breakpoint
CREATE TYPE "public"."email_status" AS ENUM('Gesendet', 'Warteschlange', 'Fehler');--> statement-breakpoint
CREATE TYPE "public"."hinweis_status" AS ENUM('Neu', 'InBearbeitung', 'Abgeschlossen');--> statement-breakpoint
CREATE TYPE "public"."meldeweg" AS ENUM('Hinweisgebersystem', 'Telefon', 'Email', 'Post');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "archiv" (
	"id" serial PRIMARY KEY NOT NULL,
	"hinweis_id" integer NOT NULL,
	"art" "archiv_art" NOT NULL,
	"ersteller" varchar(255),
	"meldung" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aufgaben" (
	"id" serial PRIMARY KEY NOT NULL,
	"hinweis_id" integer NOT NULL,
	"titel" varchar(255) NOT NULL,
	"beschreibung" text,
	"status" "aufgabe_status" DEFAULT 'Offen' NOT NULL,
	"schritt" integer DEFAULT 1 NOT NULL,
	"schritt_name" varchar(255),
	"bearbeiter_id" integer,
	"faellig_bis" timestamp with time zone,
	"start_datum" timestamp with time zone,
	"erledigt_am" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_konten" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255),
	"smtp_host" varchar(255),
	"smtp_port" integer,
	"smtp_user" varchar(255),
	"smtp_pass_encrypted" varchar(500),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_vorlagen" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_name" varchar(255),
	"from_name" varchar(255),
	"subject" varchar(500),
	"html_content" text,
	"has_attachment" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"konto_id" integer,
	"richtung" "email_richtung" NOT NULL,
	"von" varchar(255),
	"an" varchar(255),
	"betreff" varchar(500),
	"inhalt" text,
	"status" "email_status" NOT NULL,
	"hinweis_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hinweise" (
	"id" serial PRIMARY KEY NOT NULL,
	"aktenzeichen" varchar(50) NOT NULL,
	"status" "hinweis_status" DEFAULT 'Neu' NOT NULL,
	"ist_anonym" boolean DEFAULT false NOT NULL,
	"kunde_id" integer NOT NULL,
	"meldeweg" "meldeweg",
	"kategorie" varchar(255),
	"datum_verstoss" date,
	"beteiligte" text,
	"meldungstext" text,
	"hinweisgeber_anrede" "anrede",
	"hinweisgeber_vorname" varchar(255),
	"hinweisgeber_nachname" varchar(255),
	"hinweisgeber_telefon" varchar(50),
	"hinweisgeber_email" varchar(255),
	"hinweisgeber_anmerkungen" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hinweise_aktenzeichen_unique" UNIQUE("aktenzeichen")
);
--> statement-breakpoint
CREATE TABLE "kunden" (
	"id" serial PRIMARY KEY NOT NULL,
	"firma" varchar(255) NOT NULL,
	"strasse" varchar(255) NOT NULL,
	"plz" varchar(10) NOT NULL,
	"ort" varchar(255) NOT NULL,
	"telefon" varchar(50) NOT NULL,
	"telefax" varchar(50),
	"firmen_email" varchar(255) NOT NULL,
	"logo_name" varchar(255),
	"logo_url" varchar(500),
	"kundengruppe_id" integer,
	"kunden_kuerzel" varchar(50),
	"kunden_id_display" serial NOT NULL,
	"abo_modell" varchar(100),
	"meldestelle_email" varchar(255) NOT NULL,
	"ansprechpartner" varchar(255),
	"meldestelle_strasse" varchar(255),
	"meldestelle_plz" varchar(10),
	"meldestelle_ort" varchar(255),
	"meldestelle_internetseite" varchar(500),
	"meldestelle_email_public" varchar(255),
	"meldestelle_telefon_public" varchar(50),
	"link_impressum" varchar(500),
	"link_datenschutz" varchar(500),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kundengruppen" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "kundengruppen_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "mitarbeiter" (
	"id" serial PRIMARY KEY NOT NULL,
	"kunde_id" integer NOT NULL,
	"anrede" "anrede",
	"vorname" varchar(255),
	"nachname" varchar(255),
	"email1" varchar(255),
	"email2" varchar(255),
	"telefon" varchar(50),
	"mobil" varchar(50),
	"anschrift" varchar(500),
	"funktion" varchar(255),
	"ist_meldestelle" boolean DEFAULT false NOT NULL,
	"ist_geschaeftsfuehrer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"display_name" varchar(255),
	"email" varchar(255),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "archiv" ADD CONSTRAINT "archiv_hinweis_id_hinweise_id_fk" FOREIGN KEY ("hinweis_id") REFERENCES "public"."hinweise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgaben" ADD CONSTRAINT "aufgaben_hinweis_id_hinweise_id_fk" FOREIGN KEY ("hinweis_id") REFERENCES "public"."hinweise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgaben" ADD CONSTRAINT "aufgaben_bearbeiter_id_users_id_fk" FOREIGN KEY ("bearbeiter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_konto_id_email_konten_id_fk" FOREIGN KEY ("konto_id") REFERENCES "public"."email_konten"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "emails" ADD CONSTRAINT "emails_hinweis_id_hinweise_id_fk" FOREIGN KEY ("hinweis_id") REFERENCES "public"."hinweise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hinweise" ADD CONSTRAINT "hinweise_kunde_id_kunden_id_fk" FOREIGN KEY ("kunde_id") REFERENCES "public"."kunden"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kunden" ADD CONSTRAINT "kunden_kundengruppe_id_kundengruppen_id_fk" FOREIGN KEY ("kundengruppe_id") REFERENCES "public"."kundengruppen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mitarbeiter" ADD CONSTRAINT "mitarbeiter_kunde_id_kunden_id_fk" FOREIGN KEY ("kunde_id") REFERENCES "public"."kunden"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "archiv_hinweis_id_idx" ON "archiv" USING btree ("hinweis_id");--> statement-breakpoint
CREATE INDEX "aufgaben_hinweis_id_idx" ON "aufgaben" USING btree ("hinweis_id");--> statement-breakpoint
CREATE INDEX "aufgaben_bearbeiter_id_idx" ON "aufgaben" USING btree ("bearbeiter_id");--> statement-breakpoint
CREATE INDEX "aufgaben_status_idx" ON "aufgaben" USING btree ("status");--> statement-breakpoint
CREATE INDEX "emails_konto_id_idx" ON "emails" USING btree ("konto_id");--> statement-breakpoint
CREATE INDEX "emails_hinweis_id_idx" ON "emails" USING btree ("hinweis_id");--> statement-breakpoint
CREATE INDEX "hinweise_kunde_id_idx" ON "hinweise" USING btree ("kunde_id");--> statement-breakpoint
CREATE INDEX "hinweise_status_idx" ON "hinweise" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hinweise_aktenzeichen_idx" ON "hinweise" USING btree ("aktenzeichen");--> statement-breakpoint
CREATE INDEX "kunden_kundengruppe_id_idx" ON "kunden" USING btree ("kundengruppe_id");--> statement-breakpoint
CREATE INDEX "kunden_kuerzel_idx" ON "kunden" USING btree ("kunden_kuerzel");--> statement-breakpoint
CREATE INDEX "mitarbeiter_kunde_id_idx" ON "mitarbeiter" USING btree ("kunde_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");