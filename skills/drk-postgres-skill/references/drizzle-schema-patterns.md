---
title: Drizzle Schema-Patterns für DRK-Apps
impact: CRITICAL
tags: drizzle, schema, typescript, patterns
---

## Drizzle Schema-Patterns für DRK-Apps

Standardisierte Schema-Definitionen für alle DRK Variante-B Apps.

**Wiederverwendbare Basis-Spalten:**

```typescript
import { pgTable, bigserial, bigint, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

// Timestamps für jede Tabelle
const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull().$onUpdateFn(() => new Date()),
};

// Soft-Delete (optional)
const softDelete = {
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};

// Multi-Tenant (Pflicht für alle Tenant-Tabellen)
const tenantColumn = {
  tenantId: bigint('tenant_id', { mode: 'number' }).notNull(),
};
```

**Standard-Tabelle (Multi-Tenant):**

```typescript
export const documents = pgTable('documents', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  ...tenantColumn,
  title: text('title').notNull(),
  content: text('content'),
  createdBy: bigint('created_by', { mode: 'number' }).notNull(),
  ...timestamps,
}, (table) => [
  index('documents_tenant_id_idx').on(table.tenantId),
  index('documents_created_by_idx').on(table.createdBy),
]);
```

**Relations definieren:**

```typescript
import { relations } from 'drizzle-orm';

export const documentsRelations = relations(documents, ({ one }) => ({
  tenant: one(tenants, {
    fields: [documents.tenantId],
    references: [tenants.id],
  }),
  creator: one(users, {
    fields: [documents.createdBy],
    references: [users.id],
  }),
}));
```

**Dateien-Struktur:**

```
lib/
  db/
    index.ts          # Drizzle-Client-Export
    schema/
      tenants.ts      # Tenants-Tabelle
      users.ts        # Users-Tabelle
      [feature].ts    # Feature-Tabellen
      index.ts        # Re-export aller Schemas
    migrations/       # Von drizzle-kit generiert
```

**Drizzle-Client (`lib/db/index.ts`):**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10, // Für Hetzner VPS: (CPU cores * 2) + 2
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });
```
