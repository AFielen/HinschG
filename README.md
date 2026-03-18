# 🛡️ DRK Hinweisgebersystem

**Digitales Hinweisgebersystem nach dem Hinweisgeberschutzgesetz (HinSchG).**

Open Source · Kostenlos · DSGVO-konform

---

## Was ist das?

Ein vollständiges Hinweisgebersystem zur Umsetzung der EU-Whistleblower-Richtlinie und des deutschen Hinweisgeberschutzgesetzes (HinSchG). Das System ermöglicht es Mitarbeitenden, Hinweise auf Rechtsverstöße vertraulich oder anonym abzugeben – digital, sicher und datenschutzkonform.

Entwickelt für den DRK Kreisverband StädteRegion Aachen e.V. als gemeinsame interne Meldestelle für alle angeschlossenen Organisationen.

## ✨ Features

### 🌐 Öffentliche Meldestelle
* **Vertrauliche & anonyme Meldung** — Mehrstufiger Wizard für Hinweisabgabe
* **Organisationsauswahl** — Hinweise gezielt an betreute Unternehmen
* **FAQ-Bereich** — Informationen zum HinSchG direkt auf der Meldeseite
* **Alternative Meldewege** — E-Mail und Telefon als zusätzliche Kanäle

### 🔐 Admin-Backend
* **Dashboard** — KPIs, Workflow-Übersicht, Aufgaben-Tracking
* **Hinweis-Verwaltung** — Erfassen, Bearbeiten, Statusfilter (Neu/In Bearbeitung/Abgeschlossen)
* **Workflow-System** — Relevanzprüfung, Aufgabenzuweisung, Bearbeitungsschritte
* **Kunden-Verwaltung** — Organisationen, Kundengruppen, Mitarbeiter-Übersicht
* **E-Mail-System** — Posteingang, Versand, Vorlagen-Verwaltung
* **Archiv & Protokoll** — Lückenlose Dokumentation aller Bearbeitungsschritte

### 🏗️ Technisch
* **REST-API** — Vollständige CRUD-Endpunkte für alle Entitäten
* **JWT-Authentifizierung** — Sichere Session-Verwaltung
* **Rollenbasiert** — Admin- und User-Rollen
* **Docker-Ready** — docker-compose mit PostgreSQL und Caddy

## 🚀 Installation

### Docker (empfohlen)

```bash
git clone https://github.com/AFielen/HinschG.git
cd HinschG
cp .env.example .env
# .env anpassen (DATABASE_URL, JWT_SECRET, etc.)
docker compose up -d
```

### Lokal entwickeln

```bash
git clone https://github.com/AFielen/HinschG.git
cd HinschG
npm install
# PostgreSQL starten und DATABASE_URL in .env setzen
npm run db:push    # Schema in DB anlegen
npm run dev        # Dev-Server starten
```

Nach dem ersten Start: `POST /api/admin/seed` aufrufen, um den Admin-User anzulegen (admin / admin123).

## 🛠️ Tech-Stack

* [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/) (App Router, Standalone)
* [TypeScript](https://www.typescriptlang.org/) (strict)
* [Tailwind CSS 4](https://tailwindcss.com/)
* [Drizzle ORM](https://orm.drizzle.team/) + PostgreSQL
* [Jose](https://github.com/panva/jose) (JWT)
* [Nodemailer](https://nodemailer.com/) + Mailjet (E-Mail)
* Docker + Caddy (Deployment)

## 📐 Projektstruktur

```
HinschG/
├── app/
│   ├── admin/                    # Backend-Seiten (geschützt)
│   │   ├── dashboard/            # Dashboard mit KPIs
│   │   ├── hinweise/             # Hinweis-Verwaltung
│   │   ├── aufgaben/             # Aufgaben & Workflow
│   │   ├── kunden/               # Kunden-Verwaltung
│   │   ├── email/                # E-Mail-System
│   │   ├── mitarbeiter/          # Mitarbeiter-Übersicht
│   │   └── layout.tsx            # Admin-Layout mit Sidebar
│   ├── api/
│   │   ├── admin/                # Geschützte API-Endpunkte
│   │   ├── auth/                 # Login/Logout/Session
│   │   └── public/               # Öffentliche Endpunkte
│   ├── meldestelle/              # Öffentliche Meldeseite
│   │   ├── vertraulich/          # Vertrauliche Meldung
│   │   └── anonym/               # Anonyme Meldung
│   ├── login/                    # Login-Seite
│   ├── impressum/                # Pflichtseite
│   ├── datenschutz/              # Pflichtseite
│   ├── hilfe/                    # Pflichtseite
│   └── spenden/                  # Pflichtseite
├── components/
│   ├── admin/                    # Wiederverwendbare Admin-Komponenten
│   └── meldestelle/              # Meldestelle-Komponenten
├── lib/
│   ├── auth/                     # JWT, Passwort, Auth-Context
│   └── db/                       # Drizzle Schema, Verbindung, Typen
├── Dockerfile                    # Multi-Stage Docker Build
├── docker-compose.yml            # App + PostgreSQL + Caddy
├── Caddyfile                     # Reverse Proxy
├── CLAUDE.md                     # Konventionen für Claude Code
└── INFRASTRUCTURE.md             # DSGVO-Goldstandard
```

## 🔒 Datenschutz & Sicherheit

* **DSGVO-konform** — Alle Daten auf EU-Servern (Hetzner)
* **Kein US-Dienst** in der Datenverarbeitungskette
* **Verschlüsselte Übertragung** — TLS via Caddy/Let's Encrypt
* **Gehashte Passwörter** — bcrypt mit 12 Runden
* **HttpOnly Cookies** — Session-Token nicht per JavaScript auslesbar
* **Security Headers** — X-Frame-Options, CSP, Referrer-Policy
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
