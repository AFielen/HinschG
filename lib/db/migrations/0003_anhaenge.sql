CREATE TABLE "anhaenge" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "anhaenge_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hinweis_id" integer NOT NULL,
	"nachricht_id" integer,
	"dateiname" text NOT NULL,
	"mime_typ" text NOT NULL,
	"groesse" integer NOT NULL,
	"speicher_name" text NOT NULL,
	"hochgeladen_von" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "anhaenge_speicher_name_unique" UNIQUE("speicher_name")
);
--> statement-breakpoint
ALTER TABLE "anhaenge" ADD CONSTRAINT "anhaenge_hinweis_id_hinweise_id_fk" FOREIGN KEY ("hinweis_id") REFERENCES "public"."hinweise"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "anhaenge" ADD CONSTRAINT "anhaenge_nachricht_id_nachrichten_id_fk" FOREIGN KEY ("nachricht_id") REFERENCES "public"."nachrichten"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "anhaenge_hinweis_id_idx" ON "anhaenge" USING btree ("hinweis_id");