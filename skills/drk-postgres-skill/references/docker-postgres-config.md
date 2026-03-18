---
title: PostgreSQL im Docker auf Hetzner konfigurieren
impact: MEDIUM
tags: docker, hetzner, configuration, tuning
---

## PostgreSQL im Docker auf Hetzner konfigurieren

PostgreSQL-Defaults sind konservativ. Für einen Hetzner VPS (z.B. CX22: 2 vCPU, 4 GB RAM) lohnen sich Anpassungen.

**docker-compose.yml (Variante B Standard):**

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://drk:${DB_PASSWORD}@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: drk
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: app
    command: >
      postgres
      -c shared_buffers=1GB
      -c effective_cache_size=3GB
      -c work_mem=16MB
      -c maintenance_work_mem=256MB
      -c max_connections=50
      -c idle_in_transaction_session_timeout=30s
      -c idle_session_timeout=10min
      -c log_min_duration_statement=500
      -c shared_preload_libraries=pg_stat_statements
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U drk -d app"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  pgdata:
```

**Parameter-Erklärung (für 4 GB RAM VPS):**

| Parameter | Wert | Warum |
|---|---|---|
| `shared_buffers` | 1GB | ~25% des RAMs, PostgreSQL-Cache |
| `effective_cache_size` | 3GB | ~75% des RAMs, Planner-Hinweis |
| `work_mem` | 16MB | Pro Sort/Hash-Operation, nicht zu hoch |
| `maintenance_work_mem` | 256MB | Für VACUUM, CREATE INDEX |
| `max_connections` | 50 | DRK-Apps brauchen keine 100+ |
| `idle_in_transaction_session_timeout` | 30s | Vergessene Transaktionen beenden |
| `log_min_duration_statement` | 500ms | Langsame Queries loggen |

**Backup-Strategie:**

```bash
#!/bin/bash
# /opt/scripts/backup-db.sh — als Cronjob täglich ausführen
BACKUP_DIR=/backups/postgres
DATE=$(date +%Y%m%d_%H%M%S)

docker exec drk-db pg_dump -U drk app | gzip > ${BACKUP_DIR}/app_${DATE}.sql.gz

# Alte Backups löschen (behalte 30 Tage)
find ${BACKUP_DIR} -name "*.sql.gz" -mtime +30 -delete
```

```bash
# Crontab: täglich um 3:00 Uhr
0 3 * * * /opt/scripts/backup-db.sh
```

**Restore:**

```bash
gunzip -c backup.sql.gz | docker exec -i drk-db psql -U drk app
```

Reference: [PostgreSQL Configuration](https://www.postgresql.org/docs/current/runtime-config.html)
