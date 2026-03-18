---
title: N+1 Queries mit Drizzle vermeiden
impact: HIGH
tags: n-plus-one, batch, performance, drizzle
---

## N+1 Queries mit Drizzle vermeiden

N+1 Queries führen einen Query pro Element in einer Schleife aus. Stattdessen: ein einzelner Query mit JOIN oder Array.

**Falsch (N+1 in Drizzle):**

```typescript
// 1 Query für Users + N Queries für Orders = 101 Round Trips
const users = await db.select().from(usersTable).where(eq(usersTable.active, true));

for (const user of users) {
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.userId, user.id));
  // ... 100 Nutzer = 100 zusätzliche Queries!
}
```

**Richtig (ein Query mit JOIN):**

```typescript
// 1 Round Trip
const result = await db
  .select({
    userId: usersTable.id,
    userName: usersTable.name,
    orderId: ordersTable.id,
    orderTotal: ordersTable.total,
  })
  .from(usersTable)
  .leftJoin(ordersTable, eq(ordersTable.userId, usersTable.id))
  .where(eq(usersTable.active, true));
```

**Richtig (Drizzle Relational Queries):**

```typescript
// Drizzle mit Relations — lädt verschachtelt
const usersWithOrders = await db.query.users.findMany({
  where: eq(usersTable.active, true),
  with: {
    orders: true,
  },
});
```

**Richtig (Array-Parameter für Batch):**

```sql
-- Statt 100 einzelne Queries: ein Query mit ANY
select * from orders where user_id = any($1::bigint[]);
```

```typescript
import { inArray } from 'drizzle-orm';

const userIds = users.map(u => u.id);
const allOrders = await db
  .select()
  .from(ordersTable)
  .where(inArray(ordersTable.userId, userIds));
```

Reference: [Drizzle Relations](https://orm.drizzle.team/docs/rqb)
