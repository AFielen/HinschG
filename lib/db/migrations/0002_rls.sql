-- Custom SQL migration file, put your code below! --

-- Row Level Security für Mandantentrennung (fail-closed):
-- Ohne SET LOCAL app.kunde_ids liefert current_setting(..., true) NULL → keine Zeilen.
-- Zugriff ausschließlich über withTenant() (lib/db/tenant.ts).
-- NULLIF(..., 'all') ist nötig, weil PostgreSQL bei OR keine Auswertungsreihenfolge
-- garantiert: ohne NULLIF wirft der Cast 'all'::int[] einen Fehler, sobald der
-- Scope 'all' als Nicht-Superuser genutzt wird (Smoke-Test nachgewiesen).

ALTER TABLE "hinweise" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "hinweise" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY tenant_isolation ON "hinweise" FOR ALL
  USING (current_setting('app.kunde_ids', true) = 'all' OR kunde_id = ANY(string_to_array(NULLIF(current_setting('app.kunde_ids', true), 'all'), ',')::int[]))
  WITH CHECK (current_setting('app.kunde_ids', true) = 'all' OR kunde_id = ANY(string_to_array(NULLIF(current_setting('app.kunde_ids', true), 'all'), ',')::int[]));--> statement-breakpoint
ALTER TABLE "mitarbeiter" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mitarbeiter" FORCE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY tenant_isolation ON "mitarbeiter" FOR ALL
  USING (current_setting('app.kunde_ids', true) = 'all' OR kunde_id = ANY(string_to_array(NULLIF(current_setting('app.kunde_ids', true), 'all'), ',')::int[]))
  WITH CHECK (current_setting('app.kunde_ids', true) = 'all' OR kunde_id = ANY(string_to_array(NULLIF(current_setting('app.kunde_ids', true), 'all'), ',')::int[]));
