---
title: Foreign Key Spalten immer indexieren
impact: HIGH
tags: foreign-key, indexes, joins, schema
---

## Foreign Key Spalten immer indexieren

PostgreSQL indexiert Foreign Keys NICHT automatisch. Fehlende Indexes verursachen langsame JOINs und CASCADE-Operationen.

**Falsch:**

```sql
create table orders (
  id bigint generated always as identity primary key,
  tenant_id bigint references tenants(id) on delete cascade,
  user_id bigint references users(id),
  total numeric(10,2)
);
-- Kein Index auf tenant_id oder user_id!
```

**Richtig:**

```sql
create table orders (
  id bigint generated always as identity primary key,
  tenant_id bigint references tenants(id) on delete cascade not null,
  user_id bigint references users(id) not null,
  total numeric(10,2)
);

create index orders_tenant_id_idx on orders (tenant_id);
create index orders_user_id_idx on orders (user_id);
```

**Drizzle-Äquivalent:**

```typescript
import { pgTable, bigserial, bigint, numeric, index } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  tenantId: bigint('tenant_id', { mode: 'number' }).notNull().references(() => tenants.id),
  userId: bigint('user_id', { mode: 'number' }).notNull().references(() => users.id),
  total: numeric('total', { precision: 10, scale: 2 }),
}, (table) => [
  index('orders_tenant_id_idx').on(table.tenantId),
  index('orders_user_id_idx').on(table.userId),
]);
```

**Fehlende FK-Indexes finden:**

```sql
select conrelid::regclass as table_name, a.attname as fk_column
from pg_constraint c
join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
where c.contype = 'f'
  and not exists (
    select 1 from pg_index i
    where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
  );
```

Reference: [Foreign Keys](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
