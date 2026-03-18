---
title: Drizzle-Kit Migrations sicher durchführen
impact: HIGH
tags: drizzle, migrations, drizzle-kit, deployment
---

## Drizzle-Kit Migrations sicher durchführen

Migrations sind die riskanteste DB-Operation. Klare Regeln verhindern Datenverlust.

**drizzle.config.ts:**

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './lib/db/schema/index.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

**Workflow:**

```bash
# 1. Schema ändern (TypeScript-Dateien editieren)
# 2. Migration generieren
npx drizzle-kit generate

# 3. Migration prüfen (IMMER manuell lesen!)
cat lib/db/migrations/XXXX_*.sql

# 4. Migration anwenden
npx drizzle-kit migrate

# Entwicklung: Push ohne Migration-Dateien
npx drizzle-kit push
```

**Gefährliche Migrations vermeiden:**

```sql
-- FALSCH: Sperrt die ganze Tabelle bei großen Daten
CREATE INDEX orders_status_idx ON orders (status);

-- RICHTIG: Non-blocking Index-Erstellung
CREATE INDEX CONCURRENTLY orders_status_idx ON orders (status);
```

```sql
-- FALSCH: Column mit NOT NULL + DEFAULT auf großer Tabelle (vor PG 11 problematisch)
ALTER TABLE orders ADD COLUMN priority int NOT NULL DEFAULT 0;

-- RICHTIG (bei PG 16 kein Problem mehr, aber bewusst prüfen):
-- PostgreSQL 11+ setzt DEFAULT ohne Table-Rewrite
ALTER TABLE orders ADD COLUMN priority int NOT NULL DEFAULT 0;
```

**Rollback-Strategie:**

- Drizzle-Kit hat kein automatisches Rollback
- Manuell: Für jede Migration ein Rollback-SQL vorbereiten
- Vor kritischen Migrations: `pg_dump` Backup erstellen

```bash
# Backup vor Migration
docker exec drk-db pg_dump -U drk appname > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Wichtig:** Migration-Dateien werden in Git committet. Niemals generierte Migrations manuell editieren — stattdessen neue Migration generieren.

Reference: [Drizzle Migrations](https://orm.drizzle.team/docs/migrations)
