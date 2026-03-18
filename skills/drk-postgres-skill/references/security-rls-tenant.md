---
title: Row Level Security für Multi-Tenant DRK-Apps
impact: CRITICAL
tags: rls, row-level-security, multi-tenant, security, tenant-isolation
---

## Row Level Security für Multi-Tenant DRK-Apps

RLS erzwingt Tenant-Isolation auf Datenbankebene. Selbst bei Bugs im App-Code sieht ein Kreisverband nie die Daten eines anderen.

**Prinzip: Doppelte Absicherung**

1. App-Code filtert nach `tenant_id` (Drizzle WHERE-Clause)
2. PostgreSQL RLS blockiert Zugriff zusätzlich auf DB-Ebene (Defense in Depth)

**SQL-Setup (einmalig pro Tabelle):**

```sql
-- 1. RLS aktivieren
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- 2. RLS auch für Table Owner erzwingen
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

-- 3. Policy: Nur Zeilen des eigenen Tenants sichtbar
CREATE POLICY tenant_isolation ON documents
  FOR ALL
  USING (tenant_id = current_setting('app.tenant_id')::bigint);

-- 4. Index auf tenant_id (für RLS-Performance entscheidend!)
CREATE INDEX documents_tenant_id_idx ON documents (tenant_id);
```

**WICHTIG: Index auf tenant_id ist Pflicht.** Ohne Index muss PostgreSQL bei jeder Query einen Seq Scan machen, weil RLS als implizite WHERE-Clause auf jede Query angewendet wird.

**Drizzle-Wrapper (`lib/db/tenant.ts`):**

```typescript
import { db } from './index';
import { sql } from 'drizzle-orm';

/**
 * Führt eine DB-Operation im Tenant-Kontext aus.
 * SET LOCAL gilt nur für die aktuelle Transaktion.
 */
export async function withTenant<T>(
  tenantId: number,
  fn: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.tenant_id = ${tenantId.toString()}`);
    return fn(tx as unknown as typeof db);
  });
}
```

**Nutzung in API-Routes:**

```typescript
// app/api/documents/route.ts
import { withTenant } from '@/lib/db/tenant';
import { documents } from '@/lib/db/schema';

export async function GET(request: Request) {
  const session = await getSession(request);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const docs = await withTenant(session.tenantId, async (tx) => {
    return tx.select().from(documents);
    // RLS filtert automatisch — nur Dokumente des eigenen KV
  });

  return Response.json(docs);
}
```

**Häufige Fehler:**

```sql
-- FALSCH: auth.uid() — das ist Supabase-spezifisch, existiert nicht in PostgreSQL!
CREATE POLICY wrong ON documents USING (user_id = auth.uid());

-- FALSCH: RLS ohne FORCE — Table Owner umgeht die Policy
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
-- Fehlt: ALTER TABLE documents FORCE ROW LEVEL SECURITY;

-- FALSCH: current_setting ohne Index auf tenant_id
-- → Seq Scan auf jede Query, extrem langsam bei großen Tabellen

-- FALSCH: SET (ohne LOCAL) — gilt für die gesamte Connection
SET app.tenant_id = '5';
-- RICHTIG: SET LOCAL — gilt nur für aktuelle Transaktion
SET LOCAL app.tenant_id = '5';
```

**RLS-Performance testen:**

```sql
-- Prüfen ob RLS den Index nutzt
SET LOCAL app.tenant_id = '1';
EXPLAIN ANALYZE SELECT * FROM documents;
-- Erwünscht: "Index Scan using documents_tenant_id_idx"
-- Schlecht: "Seq Scan on documents" + "Rows Removed by Filter"
```

Reference: [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
