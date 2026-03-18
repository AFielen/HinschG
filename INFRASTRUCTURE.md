# INFRASTRUCTURE.md – DRK Goldstandard Infrastruktur

> **Verbindlich für alle DRK-Digitalisierungstools.**
> Dieses Dokument ergänzt die CLAUDE.md um Infrastruktur-Entscheidungen.
> Stand: März 2026 · DRK Kreisverband StädteRegion Aachen e.V.

---

## Leitprinzipien

1. Alle Daten verbleiben auf Servern in **Deutschland bzw. der EU**
2. **Kein US-Unternehmen** in der Datenverarbeitungskette (CLOUD Act, FISA 702)
3. **Open Source** wo immer möglich (kein Vendor-Lock-in)
4. **AVV** (Auftragsverarbeitungsvertrag) für jeden externen Dienstleister
5. Nachweisbare **Dokumentation aller Datenflüsse**

---

## Zwei Deployment-Varianten

Die Infrastruktur richtet sich nach der Deployment-Variante der App (siehe CLAUDE.md).

### Variante A: Statisch (Zero-Data)

Für Apps **ohne Backend, ohne Datenbank, ohne serverseitige Logik**.
Die App ist ein reines Frontend – alle Daten bleiben im Browser des Nutzers.

```
next.config.ts → output: 'export'
```

**Datenhaltung (wenn nötig):** Ausschließlich clientseitig:
- `localStorage` für Zwischenspeicherung
- `LZString`-Kompression + URL-Parameter + QR-Code für Portabilität
- JSON-Export/Import für Multi-User-Zusammenarbeit (Merge via Timestamps)
- IndexedDB für größere Datenmengen (perspektivisch)

**Hosting-Optionen (Goldstandard):**

| Option | DSGVO-Bewertung | Anmerkung |
|---|---|---|
| **GitHub Pages** | ✅ Akzeptabel | Keine personenbezogenen Daten verarbeitet, da rein statisch. GitHub (Microsoft/US) liefert nur statische Dateien aus. Kein AVV nötig, da kein Auftragsverarbeiter |
| **Hetzner (Caddy)** | ✅ Optimal | Statische Dateien via Caddy auf eigenem Server. Volle Kontrolle |
| ~~Cloudflare Pages~~ | ❌ Ausgeschlossen | US-Unternehmen, TLS-Terminierung in US-PoPs, CLOUD Act |
| ~~Vercel~~ | ❌ Ausgeschlossen | US-Unternehmen (Serverless Functions auf AWS) |
| ~~Netlify~~ | ❌ Ausgeschlossen | US-Unternehmen |

**Warum GitHub Pages akzeptabel ist:** Bei statischen Apps ohne Login, ohne Cookies, ohne Formulare werden keine personenbezogenen Daten serverseitig verarbeitet. GitHub Pages liefert lediglich HTML/CSS/JS-Dateien aus. Die IP-Adresse des Nutzers wird zwar technisch übertragen, aber GitHub agiert hier nicht als Auftragsverarbeiter. Sobald eine App personenbezogene Daten serverseitig verarbeitet, ist Variante B (Hetzner) Pflicht.

**Typische Zero-Data-Apps:** Abstimmung, Auskunft (NIS-2 Self-Check), Informationsportale, Rechner/Kalkulatoren.

---

### Variante B: Server (mit Backend / Datenbank)

Für Apps mit API-Routes, WebSocket, SSR, Datenbank, Authentifizierung.

```
next.config.ts → output: 'standalone'
```

**Infrastruktur-Stack:**

```
┌─────────────────────────────────────────────────┐
│  Nutzer-Browser                                 │
│  https://app.drk-aachen.de                      │
└──────────────────┬──────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────┐
│  Hetzner DNS                                    │
│  A-Record → IP des Hetzner Cloud Servers        │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│  Hetzner Cloud Server (Deutschland)             │
│  ┌────────────────────────────────────────────┐ │
│  │  Caddy (Reverse Proxy + Let's Encrypt)     │ │
│  │  Port 80/443 → internes Docker-Netzwerk    │ │
│  └──────────────────┬─────────────────────────┘ │
│  ┌──────────────────▼─────────────────────────┐ │
│  │  Next.js App (Docker)                      │ │
│  │  Port 3000 (intern)                        │ │
│  └──────────────────┬─────────────────────────┘ │
│  ┌──────────────────▼─────────────────────────┐ │
│  │  PostgreSQL / Supabase Self-Hosted (Docker) │ │
│  │  Port 5432 (intern, nicht öffentlich)      │ │
│  └────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────┐ │
│  │  Authentik (perspektivisch, Docker)        │ │
│  │  OAuth2 / OIDC für zentrale Auth           │ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
         │ SMTP (transaktionale E-Mails)
┌────────▼────────────────────────────────────────┐
│  Mailjet (EU, Frankreich)                       │
│  SMTP-Relay für Benachrichtigungen              │
└─────────────────────────────────────────────────┘
```

---

## Komponenten-Referenz

### Domain-Registrar: Checkdomain

| | |
|---|---|
| **Anbieter** | Checkdomain (dogado GmbH) |
| **Sitz** | Lübeck, Deutschland |
| **DSGVO** | ✅ Unproblematisch |
| **AVV** | Nach deutschem Recht verfügbar |

### DNS: Hetzner DNS

| | |
|---|---|
| **Anbieter** | Hetzner Online GmbH |
| **Sitz** | Gunzenhausen, Deutschland |
| **DSGVO** | ✅ Unproblematisch |
| **Kosten** | Kostenlos für Hetzner-Kunden |
| **Nameserver** | hydrogen.ns.hetzner.com, oxygen.ns.hetzner.com, helium.ns.hetzner.de |

**Ersetzt:** Cloudflare DNS.

### Server: Hetzner Cloud

| | |
|---|---|
| **Anbieter** | Hetzner Online GmbH |
| **Rechenzentren** | Falkenstein (Sachsen), Nürnberg (Bayern) |
| **DDoS-Schutz** | Inklusive |
| **DSGVO** | ✅ Optimal |
| **AVV** | Über Hetzner-Kundenkonto |

### Reverse Proxy & TLS: Caddy (Self-Hosted)

| | |
|---|---|
| **Software** | Caddy v2 (Open Source, Apache 2.0) |
| **Betrieb** | Docker-Container auf Hetzner |
| **TLS** | Automatisch via Let's Encrypt |
| **DSGVO** | ✅ Optimal – kein Drittanbieter |

**Ersetzt:** Cloudflare Tunnels + Cloudflare SSL.

**Warum nicht Cloudflare:** US-Unternehmen, unterliegt dem CLOUD Act. Als Reverse Proxy terminiert Cloudflare TLS in weltweit verteilten PoPs – IP-Adressen werden verarbeitet, bevor ein Cookie-Banner laden kann. Für den Sozialbereich nicht vertretbar.

**Caddyfile-Muster (Variante B):**

```caddyfile
app.drk-aachen.de {
    reverse_proxy nextjs-app:3000
}

# Weitere Apps auf Subdomains
abstimmung.drk-aachen.de {
    reverse_proxy abstimmung:3000
}
```

**Alternative:** Traefik v3 mit nativer Docker-Integration. Gleichwertig DSGVO-konform.

### Datenbank: PostgreSQL / Supabase Self-Hosted

**Dreistufiges Bewertungsmodell:**

| Stufe | Option | DSGVO | Einsatz |
|---|---|---|---|
| 🟢 **Goldstandard** | PostgreSQL oder Supabase Self-Hosted auf Hetzner | Optimal – kein Drittanbieter | Alle Apps, insb. mit Sozialdaten |
| 🟡 **Akzeptabel** | Supabase Cloud, Region Frankfurt, mit DPA + TIA | Vertretbar – US-Entity aber EU-Hosting | Nur weniger sensible Apps, Einzelfallfreigabe |
| 🔴 **Ausgeschlossen** | Firebase, PlanetScale, Neon, Supabase ohne EU-Region | Nicht konform | Kein Einsatz |

**Stufenplan:**

**Phase 1** (1–2 Apps): Einfacher PostgreSQL-Container. Zugriff aus Next.js über Prisma oder Drizzle ORM.

```yaml
# docker-compose.yml – Phase 1
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://drk:${DB_PASSWORD}@db:5432/app
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      POSTGRES_USER: drk
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: app
    restart: unless-stopped

volumes:
  pgdata:
```

```typescript
// Prisma-Schema (schema.prisma)
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**Phase 2** (3+ Apps): Migration auf Supabase Self-Hosted. Bringt REST-API (PostgREST), Auth (GoTrue), Realtime und Studio-Dashboard mit. Migration via `pg_dump` reibungslos, da Supabase auf PostgreSQL basiert.

**Warum nicht Supabase Cloud als Goldstandard:** Supabase, Inc. ist eine US-Entity (Delaware) auf AWS-Infrastruktur. Trotz EU-Region Frankfurt unterliegt Supabase dem CLOUD Act. Für Sozialdaten, Gesundheitsdaten oder Daten aus der Jugend-/Flüchtlingshilfe ausschließlich Self-Hosted.

### Transaktionale E-Mail: Mailjet

| | |
|---|---|
| **Anbieter** | Mailjet SAS (Sinch Group, Schweden) |
| **Sitz** | Paris, Frankreich |
| **Server** | EU |
| **DSGVO** | ✅ Konform – EU-Anbieter mit AVV |
| **Schnittstelle** | SMTP-Relay + REST-API |

**Nur für:** Transaktionale E-Mails (Einladungen, Benachrichtigungen, Passwortzurücksetzungen). Kein Marketing.

**Warum nicht Resend:** US-Unternehmen (San Francisco) + Amazon SES als Backend = zwei US-Entities in der Kette. CLOUD Act.

```typescript
// Mailjet SMTP in Next.js (nodemailer)
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'in-v3.mailjet.com',
  port: 587,
  auth: {
    user: process.env.MAILJET_API_KEY,
    pass: process.env.MAILJET_SECRET_KEY,
  },
});
```

### Authentifizierung: Authentik (perspektivisch)

| | |
|---|---|
| **Software** | Authentik (Open Source) |
| **Betrieb** | Docker-Container auf Hetzner |
| **Protokolle** | OAuth2, OpenID Connect, SAML, LDAP |
| **DSGVO** | ✅ Optimal – vollständig Self-Hosted |

**Zeitplan:** Relevant ab 3+ produktiven Apps. Vorher: App-eigene Auth ausreichend.
Kann teilweise durch Supabase Auth (GoTrue) abgedeckt werden, wenn Supabase Self-Hosted im Einsatz.

---

## Ausgeschlossene Dienste

| Dienst | Sitz | Problem | Ersetzt durch |
|---|---|---|---|
| Cloudflare (DNS/CDN/Tunnels) | USA | CLOUD Act, TLS-Terminierung in US-PoPs | Hetzner DNS + Caddy |
| Cloudflare Pages | USA | CLOUD Act für Serverless Functions | GitHub Pages (statisch) oder Hetzner |
| Vercel | USA | Serverless auf AWS, US-Entity | Hetzner + Docker |
| Netlify | USA | US-Entity, CLOUD Act | Hetzner + Docker |
| Resend | USA | US-Entity + Amazon SES als Backend | Mailjet (EU) |
| SendGrid | USA (Twilio) | US-Entity, CLOUD Act | Mailjet (EU) |
| AWS SES | USA (Amazon) | US-Entity, CLOUD Act | Mailjet (EU) |
| Firebase | USA (Google) | Auth nur in US-Rechenzentren | Supabase Self-Hosted |
| PlanetScale | USA | US-Entity, CLOUD Act | PostgreSQL Self-Hosted |
| Neon | USA | US-Entity, CLOUD Act | PostgreSQL Self-Hosted |
| Supabase Cloud¹ | USA (Delaware) | US-Entity auf AWS | Supabase Self-Hosted |

¹ Supabase Cloud mit EU-Region Frankfurt ist **akzeptabel** für weniger sensible Apps (mit DPA + TIA + Einzelfallfreigabe). Für Sozialdaten **ausgeschlossen**.

---

## Ergänzende Komponenten

### Monitoring

**Uptime Kuma** (Open Source, Self-Hosted) als Docker-Container. Überwacht Verfügbarkeit aller DRK-Apps, Alerting per E-Mail über Mailjet.

### Backup

Automatisierte Backups auf **Hetzner Storage Box** (räumlich getrennter Standort):
- PostgreSQL: täglicher `pg_dump`
- Docker Volumes: restic oder borgbackup
- Retention: 7 Tage / 4 Wochen / 3 Monate

### Log-Management (perspektivisch)

**Loki + Grafana** (Open Source, Self-Hosted) für zentrale Protokollierung.

---

## Datenfluss (Variante B)

```
1. Nutzer → Browser → abstimmung.drk-aachen.de
2. Hetzner DNS → löst auf IP des Hetzner Cloud Servers
3. Caddy → empfängt Anfrage, terminiert TLS (Let's Encrypt)
4. Caddy → leitet intern weiter an Next.js Docker-Container
5. Next.js → liest/schreibt PostgreSQL (internes Docker-Netzwerk)
6. Next.js → sendet ggf. E-Mail über Mailjet (SMTP, EU-Server)
7. Authentik → übernimmt Auth via OAuth2/OIDC (perspektivisch)
```

**Kritisch:** In keinem Schritt verlassen personenbezogene Daten den EU-Rechtsraum. Die TLS-Terminierung erfolgt auf dem eigenen Server.

---

## Entscheidungsmatrix: Welche Variante für meine App?

```
Braucht die App eine Datenbank?
├── Nein → Variante A (Statisch)
│   ├── Personenbezogene Daten im Browser? 
│   │   ├── Nein → GitHub Pages ✅
│   │   └── Ja (localStorage etc.) → GitHub Pages ✅ (Daten verlassen Browser nicht)
│   └── Hosting: GitHub Pages oder Hetzner/Caddy
│
└── Ja → Variante B (Server)
    ├── Sensible Daten (Sozial/Gesundheit/Jugend)?
    │   ├── Ja → Goldstandard: PostgreSQL/Supabase Self-Hosted auf Hetzner
    │   └── Nein → Supabase Cloud EU-Region akzeptabel (mit DPA + TIA)
    └── Hosting: Hetzner Cloud + Docker + Caddy
```

---

## AVV-Checkliste (Variante B)

| Anbieter | AVV-Typ | Zuständig |
|---|---|---|
| Hetzner Online GmbH | Online über Kundenkonto | CQD-Koordination |
| Checkdomain / dogado | Online über Kundenkonto | CQD-Koordination |
| Mailjet (Sinch) | DPA online verfügbar | CQD-Koordination |
| Let's Encrypt (ISRG) | Kein AVV nötig | Keine personenbez. Daten |

---

## Für Claude Code: Quick Reference

**Wenn du eine neue App aus diesem Template erstellst:**

1. **Prüfe die Deployment-Variante** anhand der CLAUDE.md Entscheidungshilfe
2. **Variante A (statisch):** `output: 'export'` in next.config.ts. Keine externen Dienste. Keine Datenbankanbindung. Hosting auf GitHub Pages oder Hetzner
3. **Variante B (server):** `output: 'standalone'` in next.config.ts. Docker-Setup mit Caddy + PostgreSQL. Konfiguration siehe docker-compose.yml Muster oben
4. **Niemals** Cloudflare, Vercel, Netlify, Firebase, Resend, SendGrid, AWS SES oder andere US-Dienste einbinden
5. **Niemals** externe Fonts (Google Fonts), Analytics, Tracking oder CDNs von US-Anbietern
6. **E-Mail** ausschließlich über Mailjet (SMTP in-v3.mailjet.com)
7. **Datenbank** ausschließlich PostgreSQL (direkt oder via Supabase Self-Hosted)
8. **Datenschutzerklärung** (`/datenschutz`) muss die tatsächlich verwendeten Dienste auflisten – bei Variante B also Hetzner und ggf. Mailjet ergänzen

**Environment Variables (Variante B):**

```env
# Datenbank
DATABASE_URL=postgresql://drk:PASSWORD@db:5432/appname

# E-Mail (nur wenn nötig)
MAILJET_API_KEY=...
MAILJET_SECRET_KEY=...
MAIL_FROM=noreply@drk-aachen.de

# App
NEXT_PUBLIC_APP_URL=https://appname.drk-aachen.de
```

---

*DRK Kreisverband StädteRegion Aachen e.V. · Henry-Dunant-Platz 1, 52146 Würselen*
