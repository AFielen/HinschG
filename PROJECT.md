# PROJECT.md – Interne Projektdokumentation

## App-Name
DRK Hinweisgebersystem

## Zweck
Digitales Hinweisgebersystem nach dem Hinweisgeberschutzgesetz (HinSchG) – gemeinsame interne Meldestelle für alle angeschlossenen DRK-Organisationen.

## Status
🟢 Funktional vollständig — vor Produktivgang: SMTP-Konto, Domain, Backup einrichten

## Zielgruppe
- Alle DRK-Kreisverbände und angeschlossene Organisationen bundesweit
- Compliance-Beauftragte und Meldestellenbearbeiter
- Mitarbeitende als Hinweisgeber (öffentliche Meldestelle)

## Architektur-Entscheidungen
- **Server-Variante B** — Next.js Standalone mit API-Routes
- **PostgreSQL 16** (Drizzle ORM) — Goldstandard Self-Hosted auf Hetzner; SQL-Migrationen in `lib/db/migrations/`, Runner `scripts/migrate.mjs` läuft beim Container-Start automatisch
- **Mandantentrennung via Row-Level-Security** — `hinweise` und `mitarbeiter` mit ENABLE + FORCE RLS; Scope wird pro Transaktion über `SET LOCAL app.kunde_ids` gesetzt (`lib/db/tenant.ts`), fail-closed (ohne Scope 0 Zeilen). Voraussetzung: DB-User ohne Superuser/BYPASSRLS
- **PII-Verschlüsselung nur für Personendaten** — Hinweisgeber-Personendaten AES-256-GCM at rest (`lib/crypto.ts`, `ENCRYPTION_KEY`); der Meldungstext bleibt bewusst unverschlüsselt, damit er durchsuchbar und im Admin-Alltag nutzbar ist. Bewusste Abwägung, dokumentiert
- **Postfach-Modell als Rückkanal** — Eingehende Kommunikation der Hinweisgeber läuft ausschließlich über das anonyme Postfach (Aktenzeichen + kryptografischer Zugangscode, bcrypt-gehasht; eigene `postfach-session`). Kein E-Mail-Eingang, dadurch keine Zuordnungs- und Vertraulichkeitsprobleme
- **Hintergrund-Jobs über `instrumentation.ts`** — Löschjob (§ 11), Fristen-Erinnerungen und E-Mail-Queue laufen im App-Prozess (15-Minuten-Tick, Tages-Guard); kein externer Cron/Worker nötig, da Single-Container-Betrieb
- **JWT-Auth** — httpOnly Cookies, bcrypt Passwort-Hashing, Rollen `admin`/`user`
- **Docker-Deployment** — docker-compose mit Caddy Reverse Proxy; App-Port nicht am Host veröffentlicht
- **Mailjet** — Transaktionale E-Mails (EU, DSGVO-konform), Versand über Queue-Worker; ohne Konfiguration deaktiviert

## Offene Punkte
- [x] Dateianhänge bei Meldungen (Upload-System) — erledigt (Postfach + Admin, 10-MB-Limit, MIME-Whitelist)
- [x] Automatische E-Mail-Benachrichtigungen — erledigt (Eingangsbestätigung, Queue-Worker via Mailjet)
- [x] Workflow-Grundschritte nach Relevanzprüfung — erledigt (Aufgaben, Zuweisung, Fristen, Protokoll)
- [x] Mehrsprachigkeit EN (öffentliche Seiten) — erledigt; Admin-Bereich bewusst nur Deutsch
- [x] Automatik-Tests — erledigt (E2E-Smoke-Test Meldung → Postfach → Admin → Upload → Mandanten-Scope)
- [ ] Reporting/Export (CSV, PDF)
- [ ] Mendix-Altsystem-Abgleich (Exportdatei folgt) — Felder, Workflow-Schritte, Vorlagen, Auswertungen vergleichen
- [ ] Vorlagen-Platzhalter-Ersetzung beim E-Mail-Versand
- ~~OAuth-Integration für E-Mail-Konten-Abruf~~ — bewusst verworfen: eingehende Kommunikation läuft über das anonyme Postfach, kein E-Mail-Eingang nötig

## Changelog
Siehe `CHANGELOG.md` (Keep-a-Changelog-Format).

- **Phase 1** – Sicherheits-Sofortmaßnahmen (Seed-Schutz, Middleware auf `/api/admin/*`, Rate-Limits, CSP/HSTS, Datenschutzerklärung neu)
- **Phase 2** – HinSchG-Kernfunktionen (anonymes Postfach, Fristen-Engine, Löschkonzept § 11, RLS-Mandantentrennung, PII-Verschlüsselung, Migrationen)
- **Phase 3** – Funktion fertiggebaut (Admin-UI komplett an APIs angebunden, E-Mail-Versand + Queue, Datei-Anhänge, E2E-getestet)
- **v1.0.0** – Initiale Version (Meldestelle, Admin-Prototyp, REST-API, Docker-Setup)
