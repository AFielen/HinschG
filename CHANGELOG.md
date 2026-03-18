# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unreleased]

## [1.0.0] – 2026-03-18

### Added

- **Öffentliche Meldestelle** (`/meldestelle`)
  - Willkommensseite mit Informationstext und FAQ (7 Einträge)
  - Vertrauliche Meldung (`/meldestelle/vertraulich`) — 4-Schritt-Wizard
  - Anonyme Meldung (`/meldestelle/anonym`) — 3-Schritt-Wizard
  - Accordion-Komponente mit CSS-Höhen-Transition
  - Eigenständiges Layout mit Steel-Blue-Design
- **Admin-Backend** (`/admin/*`)
  - Dashboard mit KPI-Karten, Workflow-Tabs, Aufgaben-Übersicht
  - Hinweis-Verwaltung: Übersicht mit Statusfilter, Erfassung, Bearbeitung
  - Kunden-Verwaltung: Übersicht, Anlegen/Bearbeiten mit Logo, Kundengruppen
  - Mitarbeiter-Übersicht über alle Kunden
  - Aufgaben-System mit Workflow-Schritten und Relevanzprüfung
  - E-Mail-System: Posteingang, Versand, Vorlagen-Verwaltung
  - Collapsible Sidebar-Navigation
- **Authentifizierung**
  - JWT-basierte Sessions (jose, httpOnly Cookies)
  - Login-Seite mit Split-Panel-Design
  - Auth-Context mit `useAuth()` Hook
  - Next.js Middleware für Route-Schutz
  - Security Headers (X-Frame-Options, CSP, etc.)
- **REST-API** (22 Route-Dateien, 49 Endpunkte)
  - Vollständige CRUD für Hinweise, Kunden, Mitarbeiter, Aufgaben
  - Dashboard-Statistiken und Chart-Daten
  - E-Mail-Konten, Vorlagen, Nachrichten
  - Archiv und Protokoll-Einträge
  - Seed-Route für initiale Admin-Erstellung
  - Zod-Validierung auf allen Eingaben
- **Datenbank** (Drizzle ORM + PostgreSQL)
  - 10 Tabellen: users, kunden, kundengruppen, mitarbeiter, hinweise, aufgaben, archiv, email_konten, email_vorlagen, emails
  - 8 PostgreSQL Enums für Status- und Rollenfelder
  - Vollständige Relations und Indizes
- **Wiederverwendbare Admin-Komponenten**
  - `DataTable` — Sortierbare Tabelle mit Pagination
  - `CollapsibleSection` — Einklappbare Formularbereiche
  - `ButtonBar` — Standardisierte Aktionsleiste
  - `StatusTabs` — Tab-Filter für Status
  - `StatusBadge` — Farbige Status-Anzeige
  - `Pagination` — Seitennavigation
- **Infrastruktur**
  - Dockerfile (Multi-Stage, node:22-alpine)
  - docker-compose.yml (App + PostgreSQL + Caddy)
  - Caddyfile für Reverse Proxy
  - .env.example mit allen Umgebungsvariablen
  - Umstellung auf Variante B (standalone)

### Changed

- `next.config.ts`: output von `'export'` auf `'standalone'` umgestellt
- `package.json`: Umbenennung zu `drk-hinweisgebersystem`, neue Dependencies
- `README.md`: Vollständige Dokumentation des Hinweisgebersystems
- `PROJECT.md`: Projektdokumentation aktualisiert
