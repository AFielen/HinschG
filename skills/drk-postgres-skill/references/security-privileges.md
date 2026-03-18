---
title: Least Privilege für Datenbank-Rollen
impact: MEDIUM
tags: privileges, security, roles, permissions
---

## Least Privilege für Datenbank-Rollen

Die App-Verbindung sollte nicht als Superuser laufen.

**Falsch (docker-compose.yml nutzt Superuser für App):**

```yaml
# App verbindet sich als postgres-Superuser — jede SQL-Injection ist fatal
DATABASE_URL: postgresql://postgres:password@db:5432/app
```

**Richtig (separate Rollen):**

```sql
-- In init.sql (wird beim ersten Start ausgeführt)

-- App-Rolle: kann lesen, schreiben, aber nicht DROP/TRUNCATE
CREATE ROLE app_user LOGIN PASSWORD 'sicheres_passwort';
GRANT CONNECT ON DATABASE app TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Für neue Tabellen automatisch Rechte vergeben
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO app_user;
```

**docker-compose.yml:**

```yaml
services:
  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      POSTGRES_USER: drk_admin
      POSTGRES_PASSWORD: ${DB_ADMIN_PASSWORD}
      POSTGRES_DB: app
  app:
    environment:
      # App nutzt eingeschränkte Rolle
      DATABASE_URL: postgresql://app_user:${DB_APP_PASSWORD}@db:5432/app
```

**Hinweis:** Für DRK Phase 1 (1-2 Apps) ist ein einzelner User akzeptabel. Bei 3+ Apps separate Rollen einführen.

Reference: [Roles and Privileges](https://www.postgresql.org/docs/current/user-manag.html)
