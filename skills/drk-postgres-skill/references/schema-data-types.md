---
title: Korrekte Datentypen wählen
impact: HIGH
tags: data-types, schema, storage, performance
---

## Korrekte Datentypen wählen

Falsche Datentypen verschwenden Speicher und verursachen Bugs.

**Falsch:**

```sql
create table users (
  id int,                    -- Overflow bei 2,1 Milliarden
  email varchar(255),        -- Unnötige Längenbeschränkung
  created_at timestamp,      -- Fehlende Zeitzone
  is_active varchar(5),      -- String für Boolean
  price varchar(20)          -- String für Geldbeträge
);
```

**Richtig:**

```sql
create table users (
  id bigint generated always as identity primary key,
  email text not null,
  created_at timestamptz default now() not null,
  is_active boolean default true not null,
  price numeric(10,2)
);
```

**Drizzle-Äquivalent:**

```typescript
import { pgTable, bigserial, text, timestamp, boolean, numeric } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
});
```

**Daumenregeln:**

- IDs: `bigint` (nicht `int` — Zukunftssicherheit)
- Strings: `text` (nicht `varchar(n)` — gleiche Performance, keine künstliche Grenze)
- Zeit: `timestamptz` (nicht `timestamp` — PostgreSQL Wiki "Don't Do This")
- Geld: `numeric` (nicht `float` — Präzision bei Cent-Beträgen)
- Booleans: `boolean` (nicht `text` oder `int`)

Reference: [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html), [Don't Do This](https://wiki.postgresql.org/wiki/Don't_Do_This)
