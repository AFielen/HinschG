---
title: Transaktionen kurz halten
impact: HIGH
tags: transactions, locking, contention, performance
---

## Transaktionen kurz halten

Lang laufende Transaktionen blockieren andere Queries. Externe Aufrufe (HTTP, E-Mail) gehören NICHT in Transaktionen.

**Falsch (externe API in Transaktion):**

```typescript
await db.transaction(async (tx) => {
  const order = await tx.select().from(orders).where(eq(orders.id, 1));
  
  // Mailjet-Aufruf dauert 2-5 Sekunden — Lock wird gehalten!
  await sendConfirmationEmail(order.email);
  
  await tx.update(orders).set({ status: 'confirmed' }).where(eq(orders.id, 1));
});
```

**Richtig (API-Call außerhalb der Transaktion):**

```typescript
// 1. Daten lesen (ohne Lock)
const order = await db.select().from(orders).where(eq(orders.id, 1));

// 2. Externen Service aufrufen
const emailSent = await sendConfirmationEmail(order.email);

// 3. Nur das Update in einer Transaktion
if (emailSent) {
  await db.update(orders)
    .set({ status: 'confirmed', confirmedAt: new Date() })
    .where(and(eq(orders.id, 1), eq(orders.status, 'pending')));
  // Lock dauert Millisekunden, nicht Sekunden
}
```

**Deadlocks vermeiden — konsistente Lock-Reihenfolge:**

```sql
-- FALSCH: Transaktion A lockt Row 1 dann 2, Transaktion B lockt Row 2 dann 1
-- → Deadlock

-- RICHTIG: Immer in ID-Reihenfolge locken
begin;
select * from accounts where id in (1, 2) order by id for update;
update accounts set balance = balance - 100 where id = 1;
update accounts set balance = balance + 100 where id = 2;
commit;
```

Reference: [Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
