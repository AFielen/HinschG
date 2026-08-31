# 🛡️ DRK Hinweisgebersystem

**Digitales Hinweisgebersystem nach dem Hinweisgeberschutzgesetz (HinSchG).**

Open Source · Kostenlos · DSGVO-konform

---

## Was ist das?

Ein vollständiges Hinweisgebersystem zur Umsetzung der EU-Whistleblower-Richtlinie (2019/1937) und des deutschen Hinweisgeberschutzgesetzes (HinSchG). Mitarbeitende können Hinweise auf Rechtsverstöße vertraulich oder anonym abgeben und über ein anonymes Postfach mit der Meldestelle in Kontakt bleiben – digital, sicher und datenschutzkonform.

Entwickelt für den DRK Kreisverband StädteRegion Aachen e.V. als gemeinsame interne Meldestelle für alle angeschlossenen Organisationen (mandantenfähig).

## ✨ Features

### 🌐 Öffentliche Meldestelle
* **Vertrauliche & anonyme Meldung** — Mehrstufige Wizards für die Hinweisabgabe; bei anonymer Meldung werden Personenfelder serverseitig verworfen
* **Organisationsauswahl** — Hinweise gezielt an die betreute Organisation (aus der Datenbank geladen)
* **Anonymes Postfach** — Rückkanal nach § 16 HinSchG: Zugangscode bei Meldungsabgabe (kryptografisch erzeugt, gehasht gespeichert), Statusabfrage, Zwei-Wege-Nachrichten, Nachreichen von Unterlagen
* **Datei-Anhänge** — Belege hochladen im Postfach und bei der Meldung (10-MB-Limit, MIME-Whitelist, Speicherung unter Zufallsnamen)
* **Automatische Eingangsbestätigung** — § 17 Abs. 1 HinSchG: sofortige Bestätigung ins Postfach, bei vertraulicher Meldung zusätzlich per E-Mail
* **Zweisprachig** — Öffentliche Seiten in Deutsch und Englisch (Admin-Bereich bewusst nur Deutsch)
* **FAQ-Bereich** — Informationen zum HinSchG direkt auf der Meldeseite, alternative Meldewege (E-Mail, Telefon)

### 🔐 Admin-Backend
* **Dashboard mit Fristen-Ampel** — KPIs, Workflow-Übersicht und HinSchG-Fristen (7 Tage Eingangsbestätigung, 3 Monate Rückmeldung) mit Überfälligkeits-Anzeige
* **Hinweis-Verwaltung** — Erfassen, Bearbeiten, Statusfilter, Nachrichten-Thread mit dem Hinweisgeber, Anhänge, Rückmeldung nach § 17 Abs. 2
* **Workflow-System** — Relevanzprüfung, Aufgabenzuweisung, Bearbeitungsschritte mit Fälligkeiten und Protokoll
* **Löschkonzept nach § 11 HinSchG** — Löschfrist 3 Jahre nach Abschluss, täglicher Löschjob, dokumentierte Löschung mit inhaltsfreiem Löschprotokoll (statt Vernichtung des Audit-Trails)
* **Mandantentrennung** — Bearbeiter sehen nur Fälle ihrer Organisation; abgesichert per Row-Level-Security direkt in PostgreSQL
* **Benutzerverwaltung** — Rollen (`admin`/`user`), Accounts anlegen/deaktivieren, eigenes Passwort ändern
* **E-Mail-System** — Versand-Warteschlange über Mailjet (EU), Vorlagen-Verwaltung, Verknüpfung mit Fällen
* **Systemprotokoll** — Logins, Fehlversuche und Benutzer-Ereignisse nachvollziehbar (nur Rolle `admin`)

### 🏗️ Technisch
* **REST-API** — Vollständige Endpunkt-Referenz in [API-INTEGRATION.md](API-INTEGRATION.md)
* **JWT-Authentifizierung** — httpOnly-Session-Cookies, bcrypt-Passwort-Hashing
* **PII-Verschlüsselung** — Personendaten der Hinweisgeber AES-256-GCM-verschlüsselt at rest
* **Rate-Limiting** — Login und Meldungsabgabe begrenzt, ohne IP-Persistierung
* **Migrationen** — Drizzle-Migrationen laufen beim Container-Start automatisch
* **Hintergrund-Jobs** — Löschfristen, Fristen-Erinnerungen und E-Mail-Queue via `instrumentation.ts`
* **Docker-Ready** — docker-compose mit PostgreSQL 16 und Caddy (TLS via Let's Encrypt)

## 🚀 Installation

### Umgebungsvariablen

`.env` aus der Vorlage erstellen und **alle Pflichtvariablen** setzen:

```bash
cp .env.example .env
```

| Variable | Pflicht | Beschreibung |
|---|---|---|
| `DB_PASSWORD` | ✅ | Passwort für den PostgreSQL-Container und die `DATABASE_URL` |
| `JWT_SECRET` | ✅ | Signaturschlüssel für Session-Tokens (min. 32 Zeichen) |
| `ENCRYPTION_KEY` | ✅ | 32-Byte-Schlüssel (Base64) für die PII-Verschlüsselung: `openssl rand -base64 32` |
| `SETUP_TOKEN` | ✅ | Einmal-Token zum Schutz der Ersteinrichtung (`/api/admin/seed`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Öffentliche URL der App |
| `MAILJET_API_KEY` / `MAILJET_SECRET_KEY` / `MAIL_FROM` | optional | E-Mail-Versand über Mailjet; ohne Konfiguration bleibt der Versand deaktiviert |
| `UPLOAD_DIR` | optional | Ablageverzeichnis für Anhänge (Default `./uploads`; im Docker-Setup vorbelegt) |

> ⚠️ **`ENCRYPTION_KEY` sicher hinterlegen:** Geht der Schlüssel verloren, sind die verschlüsselten Personendaten unwiederbringlich unlesbar. Siehe [docs/BETRIEB.md](docs/BETRIEB.md).

### Docker (empfohlen)

```bash
git clone https://github.com/AFielen/HinschG.git
cd HinschG
cp .env.example .env    # Pflichtvariablen setzen (siehe oben)
docker compose up -d
```

Die Datenbank-Migrationen laufen beim Container-Start automatisch (`scripts/migrate.mjs`), danach startet die App. TLS übernimmt Caddy; der App-Port ist nicht am Host veröffentlicht.

### Lokal entwickeln

```bash
git clone https://github.com/AFielen/HinschG.git
cd HinschG
npm install
# PostgreSQL starten und DATABASE_URL (plus JWT_SECRET, ENCRYPTION_KEY, SETUP_TOKEN) in .env setzen
npm run db:migrate    # Migrationen ausführen
npm run dev           # Dev-Server starten
```

### Ersteinrichtung (Seed)

Nach dem ersten Start den Admin-Account anlegen — nur möglich, solange noch keine Benutzer existieren, und nur mit gültigem Setup-Token:

```bash
curl -X POST http://localhost:3000/api/admin/seed -H "x-setup-token: <SETUP_TOKEN>"
```

Der Wert muss mit der Umgebungsvariable `SETUP_TOKEN` übereinstimmen. Die Antwort enthält das einmalig generierte Admin-Passwort — sicher notieren, es wird nicht erneut angezeigt.

### ⚠️ Datenbank-Benutzer und Row-Level-Security

Die Mandantentrennung basiert auf PostgreSQL Row-Level-Security. **Der Datenbank-Benutzer der App darf kein Superuser sein und kein `BYPASSRLS`-Attribut haben** — sonst werden die RLS-Policies ignoriert und die Mandantentrennung ist wirkungslos. Das Standard-Docker-Setup (Benutzer `drk`) erfüllt das; bei eigener Datenbank-Konfiguration unbedingt prüfen.

## 🛠️ Tech-Stack

* [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) (App Router, Standalone)
* [TypeScript](https://www.typescriptlang.org/) (strict)
* [Tailwind CSS 4](https://tailwindcss.com/)
* [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL 16 (Row-Level-Security)
* [Jose](https://github.com/panva/jose) (JWT) + bcrypt
* [Nodemailer](https://nodemailer.com/) + Mailjet (E-Mail, EU)
* [Zod](https://zod.dev/) (Validierung)
* Docker + Caddy (Deployment)

## 📐 Projektstruktur

```
HinschG/
├── app/
│   ├── (drk)/                    # Öffentliche DRK-Seiten (Route-Group)
│   │   ├── page.tsx              # Startseite
│   │   ├── impressum/            # Pflichtseite
│   │   ├── datenschutz/          # Pflichtseite (HinSchG-spezifisch)
│   │   ├── hilfe/                # Pflichtseite
│   │   └── spenden/              # Pflichtseite
│   ├── meldestelle/              # Öffentliche Meldestelle (eigenes Layout)
│   │   ├── vertraulich/          # Vertrauliche Meldung (Wizard)
│   │   ├── anonym/               # Anonyme Meldung (Wizard)
│   │   └── postfach/             # Anonymes Postfach (Zugangscode)
│   ├── admin/                    # Backend-Seiten (geschützt)
│   │   ├── dashboard/            # KPIs + Fristen-Ampel
│   │   ├── hinweise/             # Hinweis-Verwaltung
│   │   ├── aufgaben/             # Aufgaben & Workflow
│   │   ├── kunden/               # Organisationen (Mandanten)
│   │   ├── mitarbeiter/          # Mitarbeiter-Übersicht
│   │   ├── benutzer/             # Benutzerverwaltung
│   │   └── email/                # E-Mail-Queue + Vorlagen
│   ├── api/
│   │   ├── public/               # Meldung, Postfach, Organisationsliste
│   │   ├── auth/                 # Login/Logout/Session
│   │   ├── admin/                # Geschützte Endpunkte (Session-Cookie)
│   │   └── health/               # Health-Check
│   └── login/                    # Login-Seite
├── components/
│   ├── admin/                    # DataTable, Formulare, StatusBadge …
│   └── meldestelle/              # Meldestelle-Komponenten
├── lib/
│   ├── auth/                     # JWT, Passwort, Middleware, Auth-Context
│   ├── db/                       # Drizzle-Schema, Tenant-Scope (RLS)
│   │   └── migrations/           # SQL-Migrationen (Baseline, RLS, Anhänge)
│   ├── crypto.ts                 # PII-Verschlüsselung (AES-256-GCM)
│   ├── fristen.ts                # HinSchG-Fristberechnung (§ 17, § 11)
│   ├── loeschung.ts              # Dokumentierte Löschung + Löschprotokoll
│   ├── jobs.ts                   # Hintergrund-Jobs (Löschung, Fristen, Mail-Queue)
│   ├── anhaenge.ts               # Datei-Anhänge (Limits, MIME-Whitelist)
│   ├── mail.ts                   # Mailjet-SMTP-Versand
│   ├── kategorien.ts             # Zentrale Kategorienliste
│   ├── aktenzeichen.ts           # Aktenzeichen + Zugangscodes (crypto)
│   └── rate-limit.ts             # In-Memory-Rate-Limiter
├── scripts/
│   └── migrate.mjs               # Migrations-Runner (Container-Start / npm run db:migrate)
├── docs/
│   └── BETRIEB.md                # Betriebshandbuch (Setup, Backup, Schlüssel, Monitoring)
├── instrumentation.ts            # Startet die Hintergrund-Jobs
├── middleware.ts                 # Auth-Schutz + Security-Header (CSP, HSTS)
├── Dockerfile                    # Multi-Stage Build, Non-Root, Auto-Migration
├── docker-compose.yml            # App + PostgreSQL + Caddy
├── Caddyfile                     # Reverse Proxy + TLS
├── API-INTEGRATION.md            # Endpunkt-Referenz
├── CLAUDE.md                     # Konventionen für Claude Code
└── INFRASTRUCTURE.md             # DSGVO-Goldstandard
```

## 🔒 Datenschutz & Sicherheit

* **DSGVO-konform** — Alle Daten auf EU-Servern (Hetzner), E-Mail nur über Mailjet (EU)
* **Kein US-Dienst** in der Datenverarbeitungskette
* **PII-Verschlüsselung** — Personendaten der Hinweisgeber AES-256-GCM-verschlüsselt in der Datenbank
* **Mandantentrennung** — Row-Level-Security (ENABLE + FORCE) in PostgreSQL, fail-closed
* **Löschkonzept** — Automatische Löschung 3 Jahre nach Abschluss (§ 11 Abs. 5 HinSchG) mit inhaltsfreiem Löschprotokoll
* **Verschlüsselte Übertragung** — TLS via Caddy/Let's Encrypt; App-Port nicht am Host veröffentlicht
* **Gehashte Geheimnisse** — Passwörter und Postfach-Zugangscodes mit bcrypt (12 Runden)
* **HttpOnly Cookies** — Session-Token nicht per JavaScript auslesbar; nur technisch notwendige Cookies
* **Security Headers** — Content-Security-Policy, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
* **Rate-Limiting** — Login, Postfach-Login und Meldungsabgabe begrenzt; IP-Adressen werden nicht persistiert
* **Geschützter Seed** — Ersteinrichtung nur mit `SETUP_TOKEN`, generiertes Zufallspasswort statt Standard-Zugangsdaten
* **Open Source** — Vollständig auditierbar

## 🤝 Beitragen

1. Fork erstellen
2. Feature-Branch: `git checkout -b feat/mein-feature`
3. Änderungen committen: `git commit -m "feat: Beschreibung"`
4. Push: `git push origin feat/mein-feature`
5. Pull Request erstellen

## 📄 Lizenz

MIT — Frei verwendbar für alle DRK-Gliederungen und darüber hinaus.

## 🏥 Über

Ein Projekt des [DRK Kreisverband StädteRegion Aachen e.V.](https://www.drk-aachen.de/)

---

*Gebaut mit ❤️ für das Deutsche Rote Kreuz*
