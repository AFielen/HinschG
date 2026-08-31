# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unreleased]

### Added

- `AUDIT.md` — vollständiger Audit-Bericht (Bestandsaufnahme, HinSchG-/DSGVO-/Sicherheits-Befunde, Roadmap in 4 Phasen)
- **Anonymes Postfach / Rückkanal (§ 16 HinSchG):** Zugangscode bei Meldungsabgabe (kryptografisch, bcrypt-gehasht), Routen `/api/public/postfach{,/login,/nachricht,/logout}`, Seite `/meldestelle/postfach` mit Status und Zwei-Wege-Nachrichten (`nachrichten`-Tabelle)
- **Fristen-Engine (§ 17 HinSchG):** `lib/fristen.ts` (+7 Tage Eingangsbestätigung, +3 Monate Rückmeldung), automatische Eingangsbestätigung als Postfach-Nachricht bei Eingang, `GET /api/admin/dashboard/fristen` (überfällig/bald fällig), tägliche Erinnerungs-Aufgaben
- **Löschkonzept (§ 11 Abs. 5 HinSchG):** `loeschenAm` = Abschluss + 3 Jahre, täglicher Löschjob, `lib/loeschung.ts` mit `loeschprotokoll`-Tabelle (dokumentierte Löschung statt Audit-Trail-Vernichtung); manuelles Löschen nur noch als Admin über denselben Weg
- **Mandantentrennung:** `users.kundeId`, Scope-Filter in allen Fall-Routen, Row-Level-Security (ENABLE+FORCE) auf `hinweise` und `mitarbeiter` via `lib/db/tenant.ts` (`SET LOCAL app.kunde_ids`)
- **PII-Verschlüsselung at rest:** `lib/crypto.ts` (AES-256-GCM, `ENCRYPTION_KEY`) für Hinweisgeber-Personendaten; Meldungstext bleibt durchsuchbar
- **Drizzle-Migrationen:** Baseline + Phase-2- + RLS-Migration in `lib/db/migrations/`, Runner `scripts/migrate.mjs` (`npm run db:migrate`), Migrationslauf beim Container-Start; gegen PostgreSQL 16 smoke-getestet
- Hintergrund-Jobs via `instrumentation.ts`/`lib/jobs.ts` (Löschjob, Fristen-Erinnerung, E-Mail-Queue-Stub)
- `system_protokoll`-Tabelle + `GET /api/admin/protokoll` (Logins, Fehlversuche, Benutzer-/Seed-Ereignisse)
- `POST /api/admin/hinweise/[id]/nachricht` (Antwort an Hinweisgeber, optional als Rückmeldung § 17 Abs. 2)
- Aktenzeichen aus `lib/aktenzeichen.ts` (crypto.randomInt, Kollisions-Retry) statt `Math.random()`
- **Datei-Anhänge:** `anhaenge`-Tabelle (Migration 0003), `lib/anhaenge.ts` (10-MB-Limit, MIME-Whitelist, UUID-Speicherung in `UPLOAD_DIR`), Upload/Download im Postfach (`/api/public/postfach/anhang*`) und Admin (`/api/admin/hinweise/[id]/anhang`, `/api/admin/anhaenge/[id]`), Docker-Volume `uploads`
- **E-Mail-Versand:** `lib/mail.ts` (nodemailer, Mailjet-SMTP), Queue-Worker in `lib/jobs.ts` (max 20/Tick), automatische Eingangsbestätigungs-E-Mail bei vertraulicher Meldung (ohne Zugangscode)
- `lib/kategorien.ts` — zentrale Kategorienliste, serverseitig validiert (public + admin)
- `GET /api/health` (Status/Version/Timestamp)
- `GET /api/admin/users?zweck=zuweisung` — Bearbeiter-Auswahl für Zuweisungen (alle eingeloggten Nutzer)

### Changed

- **Admin-UI vollständig an die APIs angebunden** (Demo-Daten entfernt): Hinweise-Liste/-Detail/-Erfassung (`HinweisForm` mit Nachrichten-Thread, Rückmeldungs-Checkbox, Anhängen, Fristen-Infobox, Zugangscode-Anzeige nach Erfassung), Aufgaben (Workflow-Schritte, Zuweisen/Abschließen/Bearbeiten, Relevanzentscheidung), Dashboard (Fristen-Karte, Zeitraum-Refetch, korrigierte KPI-Anbindung), Kunden inkl. Mitarbeiter-CRUD, Mitarbeiter-Übersicht, E-Mail (echter Posteingang/Warteschlange, Senden in Queue, Vorlagen-Editor speichert)
- Melde-Wizards: Organisationsauswahl dynamisch aus `GET /api/public/kunden`, Kategorien aus `lib/kategorien.ts`
- `DataTable`: Sortier-Bug behoben (leere Seite nach Sortierklick), optionale server-seitige Pagination/Sortierung
- Aufruf der nicht existierenden Route `/api/admin/aufgaben/[id]/workflow` entfernt; tote Buttons (OAuth, Abrufen, Konten verwalten u.a.) entfernt oder verdrahtet
- `lib/loeschung.ts` löscht Anhänge (DB + Dateien) mit
- End-to-End-Smoke-Test bestanden: Meldung → Postfach → Admin-Kommunikation → Upload → Mandanten-Scope (PostgreSQL 16, Standalone-Build)
- `lib/rate-limit.ts` — In-Memory-Rate-Limiter (Sliding Window); aktiv auf Login (5/15 Min) und öffentlicher Meldungsabgabe (5/Std)
- Benutzerverwaltung: API `/api/admin/users`, `/api/admin/users/[id]`, `/api/admin/me/password` (nur Rolle `admin` bzw. eigenes Passwort) und Admin-Seite `/admin/benutzer` inkl. „Eigenes Passwort ändern"
- `requireRole()` in `lib/auth/middleware.ts` für rollenbasierte API-Autorisierung
- Security-Header: Content-Security-Policy und Strict-Transport-Security (Production) in `middleware.ts`; HSTS zusätzlich im `Caddyfile`
- `.dockerignore`; `.env.example` um `DB_PASSWORD`, `SETUP_TOKEN`, `ENCRYPTION_KEY` ergänzt

### Changed

- `middleware.ts` schützt jetzt auch `/api/admin/*` (401 JSON; Ausnahme: selbstgeschützte Seed-Route)
- `app/api/admin/seed/route.ts`: Setup nur noch mit Header `x-setup-token` (Env `SETUP_TOKEN`); Admin-Passwort wird kryptografisch generiert und einmalig zurückgegeben — `admin123` entfernt
- `app/api/public/hinweis/route.ts`: Zod-Validierung gehärtet (Längen-/Formatgrenzen), keine Validierungsdetails mehr im Fehler-Response
- `app/api/admin/email-konten`: SMTP-Passwort wird nicht mehr an den Client ausgegeben
- `app/datenschutz/page.tsx` vollständig neu — wahrheitsgemäß für das Hinweisgebersystem (HinSchG-Rechtsgrundlagen, Session-Cookie, 3-Jahres-Löschfrist, Hetzner/Mailjet)
- `app/page.tsx` (echte Startseite mit Link zur Meldestelle), `app/hilfe/page.tsx` (echte FAQ), `components/Header.tsx` + alle Metadata-Titel: Template-Platzhalter `APP_TITEL` ersetzt durch „DRK Hinweisgebersystem"
- `docker-compose.yml`: App-Port nicht mehr am Host veröffentlicht (nur Caddy), DB-Healthcheck + `depends_on: service_healthy`
- `Dockerfile`: läuft als Nicht-Root (`USER node`), `HOSTNAME`/`PORT` gesetzt; `next.config.ts`: `poweredByHeader: false`
- `README.md`: Seed-Prozedur und Sicherheitsangaben an den tatsächlichen Stand angepasst

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
