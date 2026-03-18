---
title: EXPLAIN ANALYZE für langsame Queries
impact: MEDIUM
tags: explain, analyze, diagnostics, query-plan
---

## EXPLAIN ANALYZE für langsame Queries

EXPLAIN ANALYZE führt die Query aus und zeigt tatsächliche Ausführungszeiten.

**Statt raten — messen:**

```sql
explain (analyze, buffers, format text)
select * from orders where tenant_id = 1 and status = 'pending';
```

**Was die Ausgabe verrät:**

```
Seq Scan on orders                          → Fehlender Index!
  Rows Removed by Filter: 999950           → Schlechte Selektivität
  Buffers: shared read=15000               → Daten nicht gecached
  
Index Scan using orders_tenant_status_idx   → Index wird genutzt ✓
  Buffers: shared hit=5                    → Aus Cache gelesen ✓
```

**Warnsignale:**

| Ausgabe | Problem | Lösung |
|---|---|---|
| `Seq Scan` auf großer Tabelle | Fehlender Index | `CREATE INDEX` |
| `Rows Removed by Filter` hoch | Index deckt Filter nicht ab | Composite Index |
| `Buffers: read >> hit` | Daten nicht im Cache | `shared_buffers` erhöhen |
| `Sort Method: external merge` | `work_mem` zu niedrig | `work_mem` erhöhen |

**pg_stat_statements aktivieren (Docker):**

```yaml
# docker-compose.yml
db:
  image: postgres:16-alpine
  command: postgres -c shared_preload_libraries=pg_stat_statements
```

```sql
create extension if not exists pg_stat_statements;

-- Top 10 langsamste Queries
select calls, round(mean_exec_time::numeric, 2) as avg_ms, query
from pg_stat_statements
order by mean_exec_time desc
limit 10;
```

Reference: [EXPLAIN](https://www.postgresql.org/docs/current/sql-explain.html), [pg_stat_statements](https://www.postgresql.org/docs/current/pgstatstatements.html)
