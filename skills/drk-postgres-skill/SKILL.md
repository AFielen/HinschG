# DRK PostgreSQL & Drizzle Best Practices

PostgreSQL 16 Best Practices für DRK-Digitalisierungstools.
Stack: Next.js 16 + Drizzle ORM + PostgreSQL 16 (Docker) + Hetzner.

## Scope

Dieser Skill gilt für alle DRK-Apps mit Variante B (Server + Datenbank).
Siehe INFRASTRUCTURE.md im drk-app-template für den DSGVO-Goldstandard.

## Referenzen

Die `references/`-Dateien enthalten konkrete SQL- und Drizzle-Patterns.
Jede Datei ist nach dem Schema `kategorie-thema.md` benannt.

### Kategorien (nach Priorität)

1. **schema** — Tabellen, Datentypen, Primary Keys, Foreign Keys
2. **drizzle** — Drizzle-ORM-Patterns, Schema, Migrations, Multi-Tenant
3. **security** — RLS, Least Privilege, Tenant-Isolation
4. **query** — Indexes, Query-Optimierung
5. **data** — N+1, Upserts, Batch-Inserts
6. **lock** — Transaktionen kurz halten, Deadlocks vermeiden
7. **monitor** — EXPLAIN ANALYZE, pg_stat_statements
8. **docker** — PostgreSQL-Konfiguration im Docker-Kontext

## Schnellregeln

- **Immer `bigint generated always as identity`** für Primary Keys (nicht `serial`)
- **Immer `timestamptz`** statt `timestamp`
- **Immer `text`** statt `varchar(n)` (außer bei echtem Constraint-Bedarf)
- **Immer Foreign Keys indexieren** — PostgreSQL macht das nicht automatisch
- **Immer `snake_case`** für Tabellen und Spalten
- **Immer `tenant_id` + RLS** für Multi-Tenant-Tabellen
- **Nie `SELECT *`** in Produktion
- **Nie API-Calls innerhalb von Transaktionen**
