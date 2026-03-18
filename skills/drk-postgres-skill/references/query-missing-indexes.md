---
title: Indexes auf WHERE- und JOIN-Spalten setzen
impact: CRITICAL
tags: indexes, performance, sequential-scan, query-optimization
---

## Indexes auf WHERE- und JOIN-Spalten setzen

Queries auf nicht-indexierten Spalten verursachen Full Table Scans — exponentiell langsamer bei wachsenden Tabellen.

**Falsch (Seq Scan auf großer Tabelle):**

```sql
-- Kein Index auf tenant_id + status
select * from orders where tenant_id = 1 and status = 'pending';
-- EXPLAIN: Seq Scan on orders (cost=0.00..25000.00)
```

**Richtig:**

```sql
-- Composite Index für häufige Filter-Kombination
create index orders_tenant_status_idx on orders (tenant_id, status);
-- EXPLAIN: Index Scan using orders_tenant_status_idx (cost=0.42..8.44)
```

**Drizzle-Äquivalent:**

```typescript
export const orders = pgTable('orders', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  tenantId: bigint('tenant_id', { mode: 'number' }).notNull(),
  status: text('status').notNull(),
  total: numeric('total', { precision: 10, scale: 2 }),
}, (table) => [
  index('orders_tenant_status_idx').on(table.tenantId, table.status),
]);
```

**Composite Index — Spaltenreihenfolge zählt:**

```sql
-- Equality-Spalten zuerst, Range-Spalten zuletzt
create index idx on orders (tenant_id, status, created_at);

-- Nutzt Index: WHERE tenant_id = 1
-- Nutzt Index: WHERE tenant_id = 1 AND status = 'pending'
-- Nutzt Index: WHERE tenant_id = 1 AND status = 'pending' AND created_at > '2024-01-01'
-- Nutzt NICHT: WHERE status = 'pending' (Leftmost-Prefix-Rule)
```

Reference: [Indexes](https://www.postgresql.org/docs/current/indexes.html)
