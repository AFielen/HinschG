---
title: Lowercase snake_case für alle Bezeichner
impact: MEDIUM
tags: naming, identifiers, schema, conventions
---

## Lowercase snake_case für alle Bezeichner

PostgreSQL faltet unquotierte Bezeichner auf Kleinbuchstaben. Quoted camelCase erfordert für immer Anführungszeichen.

**Falsch:**

```sql
CREATE TABLE "Users" (
  "userId" bigint PRIMARY KEY,
  "firstName" text
);
-- Muss immer: SELECT "firstName" FROM "Users"
```

**Richtig:**

```sql
create table users (
  user_id bigint primary key,
  first_name text
);
-- Funktioniert ohne Quotes: SELECT first_name FROM users
```

**Drizzle-Konvention:**

```typescript
// TypeScript: camelCase in Code, snake_case in DB
export const users = pgTable('users', {
  userId: bigserial('user_id', { mode: 'number' }).primaryKey(),
  firstName: text('first_name'),
});
// Drizzle mappt automatisch: userId → user_id
```

**DRK-Konvention:**

- Tabellen: `snake_case`, Plural (`users`, `audit_logs`)
- Spalten: `snake_case`, Singular (`first_name`, `created_at`)
- Indexes: `tabelle_spalte_idx` (`orders_tenant_id_idx`)
- Constraints: `tabelle_spalte_check` / `tabelle_spalte_fkey`

Reference: [SQL Identifiers](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)
