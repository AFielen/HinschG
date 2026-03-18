---
title: Identity Columns statt Serial für Primary Keys
impact: HIGH
tags: primary-key, identity, serial, schema
---

## Identity Columns statt Serial

`serial` hat unerwünschte Verhaltensweisen bei Permissions und Dependencies. `identity` ist der SQL-Standard.

**Falsch:**

```sql
create table users (
  id serial primary key  -- Veraltet, nicht SQL-Standard
);

create table orders (
  id uuid default gen_random_uuid() primary key  -- UUIDv4 = zufällig = Index-Fragmentierung
);
```

**Richtig:**

```sql
create table users (
  id bigint generated always as identity primary key
);
```

**Drizzle-Äquivalent:**

```typescript
export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
});
```

**Richtlinien:**

- Standard: `bigint identity` (sequentiell, 8 Bytes, SQL-Standard)
- UUIDs nur wenn extern exponiert (API-IDs) — dann UUIDv7 (zeitgeordnet, keine Fragmentierung)
- `serial` funktioniert, aber `identity` ist der empfohlene Weg für neue Apps

Reference: [Identity Columns](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-PARMS-GENERATED-IDENTITY)
