# PROJECT.md – Interne Projektdokumentation

## App-Name
DRK Hinweisgebersystem

## Zweck
Digitales Hinweisgebersystem nach dem Hinweisgeberschutzgesetz (HinSchG) – gemeinsame interne Meldestelle für alle angeschlossenen DRK-Organisationen.

## Status
🟡 In Entwicklung

## Zielgruppe
- Alle DRK-Kreisverbände und angeschlossene Organisationen bundesweit
- Compliance-Beauftragte und Meldestellenbearbeiter
- Mitarbeitende als Hinweisgeber (öffentliche Meldestelle)

## Architektur-Entscheidungen
- **Server-Variante B** — Next.js Standalone mit API-Routes
- **PostgreSQL** (Drizzle ORM) — Goldstandard Self-Hosted auf Hetzner
- **JWT-Auth** — httpOnly Cookies, bcrypt Passwort-Hashing
- **Docker-Deployment** — docker-compose mit Caddy Reverse Proxy
- **Mailjet** — Transaktionale E-Mails (EU, DSGVO-konform)

## Offene Punkte
- [ ] Dateianhänge bei Meldungen (Upload-System)
- [ ] OAuth-Integration für E-Mail-Konten
- [ ] Automatische E-Mail-Benachrichtigungen bei neuen Hinweisen
- [ ] Detaillierte Workflow-Schritte (nach Relevanzprüfung)
- [ ] Reporting/Export (CSV, PDF)
- [ ] Mehrsprachigkeit (EN)
- [ ] Automatik-Tests

## Changelog
- **v1.0.0** – Initiale Version mit vollständigem Frontend + Backend
  - Öffentliche Meldestelle (vertraulich + anonym)
  - Admin-Backend (Dashboard, Hinweise, Kunden, Aufgaben, E-Mail)
  - REST-API mit JWT-Authentifizierung
  - Docker-Setup mit PostgreSQL + Caddy
