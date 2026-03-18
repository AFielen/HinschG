---
title: UPSERT statt SELECT-dann-INSERT
impact: MEDIUM
tags: upsert, on-conflict, insert, update, drizzle
---

## UPSERT statt SELECT-dann-INSERT

Separate SELECT → INSERT/UPDATE erzeugt Race Conditions. `ON CONFLICT` ist atomar.

**Falsch (Race Condition):**

```typescript
const existing = await db.select().from(settings).where(
  and(eq(settings.userId, 123), eq(settings.key, 'theme'))
);
if (existing.length > 0) {
  await db.update(settings).set({ value: 'dark' }).where(...);
} else {
  await db.insert(settings).values({ userId: 123, key: 'theme', value: 'dark' });
}
// Zwei parallele Requests → Duplicate Key Error!
```

**Richtig (Drizzle UPSERT):**

```typescript
await db.insert(settings)
  .values({ userId: 123, key: 'theme', value: 'dark' })
  .onConflictDoUpdate({
    target: [settings.userId, settings.key],
    set: { value: 'dark', updatedAt: new Date() },
  });
```

**Insert-or-Ignore:**

```typescript
await db.insert(pageViews)
  .values({ pageId: 1, userId: 123 })
  .onConflictDoNothing({
    target: [pageViews.pageId, pageViews.userId],
  });
```

Reference: [INSERT ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT)
