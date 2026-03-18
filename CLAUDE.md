# DRK App Template – Konventionen für Claude Code

## Überblick

Dieses Repository ist das offizielle Starter-Template für alle DRK-Digitalisierungstools, entwickelt vom DRK Kreisverband StädteRegion Aachen e.V. Jede neue App wird aus diesem Template erstellt und folgt den hier definierten Konventionen.

**Infrastruktur-Richtlinien:** Siehe `INFRASTRUCTURE.md` für den verbindlichen DSGVO-Goldstandard (erlaubte/verbotene Dienste, Hosting, Datenbank, E-Mail).

**Referenz-Apps (aktueller Stand):**
- Abstimmung: https://github.com/AFielen/abstimmung
- Auskunft: https://github.com/AFielen/auskunft

Bei Unklarheiten zu Design oder Architektur: Referenz-Apps als Quelle der Wahrheit nutzen.

---

## Tech-Stack (IMMER verwenden)

| Technologie | Version | Zweck |
|---|---|---|
| Next.js | 16 | App-Framework (App Router) |
| React | 19 | UI-Library |
| TypeScript | strict | Typisierung |
| Tailwind CSS | 4 | Styling |

**NICHT verwenden:**
- Keine CSS-Module, kein styled-components, kein Sass
- Keine externen Fonts (Google Fonts etc.) – Fonts immer lokal hosten
- Keine externen Analytics/Tracking-Dienste
- Keine Cookies
- Kein jQuery oder andere Legacy-Libraries

---

## Deployment-Strategie

Nicht jede App braucht ein Backend oder einen eigenen Server. Die Deployment-Methode richtet sich nach der App.

### Variante A: Statisch (kein Server nötig)

Für Apps die KEIN Backend, KEINE serverseitige Logik und KEINE persistente Datenhaltung brauchen.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'export',
};
```

**Hosting:** GitHub Pages, Hetzner (via Caddy), jeder statische Webserver. Siehe INFRASTRUCTURE.md.
**Kein Docker nötig.**

### Variante B: Server (Node.js Backend)

Für Apps mit API-Routes, WebSocket, SSR, Dateisystem-Zugriff.

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
};
```

**Docker-Setup (nur bei Variante B):**

```dockerfile
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    restart: unless-stopped
```

### Entscheidungshilfe

| Frage | Statisch | Server |
|---|---|---|
| Eigene API nötig? | Nein | Ja |
| WebSocket / Echtzeit? | Nein | Ja |
| Dateien auf Server lesen/schreiben? | Nein | Ja |
| Reicht GitHub Pages? | Ja | Nein |

**Wenn unklar:** Erst statisch starten. Server kann nachgerüstet werden.

---

## Projektstruktur

```
app-name/
├── CLAUDE.md                    # ← Diese Datei
├── INFRASTRUCTURE.md            # DSGVO-Goldstandard Infrastruktur
├── app/
│   ├── layout.tsx               # Root-Layout: DRK-Header + Footer
│   ├── page.tsx                 # Startseite
│   ├── globals.css              # DRK CSS-Variablen + Basis-Styles
│   ├── not-found.tsx            # Custom 404
│   ├── impressum/page.tsx       # Pflicht
│   ├── datenschutz/page.tsx     # Pflicht
│   ├── hilfe/page.tsx           # Pflicht
│   ├── spenden/page.tsx         # Pflicht
│   └── api/                     # Nur bei Server-Variante
├── components/                  # React-Komponenten
├── lib/
│   ├── types.ts
│   ├── i18n.ts                  # Übersetzungen (DE/EN)
│   └── version.ts
├── public/
│   ├── logo.png                 # DRK-Logo (42x42)
│   ├── logo.svg
│   └── favicon.svg
├── API-INTEGRATION.md           # Wenn API vorhanden
├── PROJECT.md
├── README.md                    # Pflicht (siehe Format unten)
├── Dockerfile                   # Nur bei Server-Variante
├── docker-compose.yml           # Nur bei Server-Variante
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── next.config.ts
```

---

## Design-System

### CSS-Variablen (in globals.css)

```css
:root {
  /* Primärfarbe */
  --drk: #e30613;
  --drk-dark: #b8000f;
  --drk-light: #ff1a2e;
  --drk-bg: #fef2f2;

  /* Text */
  --text: #212529;
  --text-light: #6b7280;
  --text-muted: #9ca3af;

  /* Hintergrund & Rahmen */
  --bg: #f8f9fa;
  --bg-card: #ffffff;
  --border: #e5e7eb;

  /* Funktionale Farben */
  --success: #28a745;
  --warning: #ffc107;
  --info: #17a2b8;
}
```

**WICHTIG:** In Komponenten `style={{ color: 'var(--drk)' }}` nutzen statt Tailwind-Hardcoded-Farben, damit Konsistenz gewahrt bleibt. Tailwind-Klassen für Layout, CSS-Variablen für DRK-Farben.

### Header (IMMER gleich)

- Hintergrund: `#e30613` (inline style, nicht Tailwind)
- Text: Weiß
- Links: DRK-Logo `logo.png` (42×42px)
- Daneben: App-Titel `text-[1.4rem] font-bold` + Untertitel `text-[0.8rem] opacity-85`
- Rechts: SVG-Icon-Buttons (❤ Spenden + ❓ Hilfe), jeweils `w-9 h-9 rounded-full hover:bg-white/10`
- Layout: `flex items-center justify-between gap-3 px-6 py-4`
- NICHT sticky/fixed (scrolt mit)

```tsx
<header
  className="flex items-center justify-between gap-3 px-6 py-4"
  style={{ background: '#e30613', color: '#fff' }}
>
  <Link href="/" className="flex items-center gap-3">
    <img src="/logo.png" alt="DRK Logo" width={42} height={42} />
    <div>
      <h1 className="text-[1.4rem] font-bold leading-tight">APP_TITEL</h1>
      <div className="text-[0.8rem] opacity-85">APP_UNTERTITEL</div>
    </div>
  </Link>
  <div className="flex items-center gap-1">
    <Link href="/spenden" title="Unterstützen"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors">
      <!-- Heart SVG Icon -->
    </Link>
    <Link href="/hilfe" title="Hilfe"
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-white/10 transition-colors">
      <!-- Question-Circle SVG Icon -->
    </Link>
  </div>
</header>
```

**Icons:** Immer Inline-SVGs (Lucide-Style, stroke-basiert). KEINE Emojis im Header, KEINE Icon-Libraries.

### Footer (IMMER gleich)

Der Footer ist HELL (weißer Hintergrund), ZENTRIERT und hat eine klare Hierarchie:

1. **"DEUTSCHES ROTES KREUZ"** – Rot, uppercase, bold, tracking-widest
2. **"Kreisverband StädteRegion Aachen e.V."** – Grau, normal
3. **Links** – Impressum · Datenschutz · Hilfe · Unterstützen (getrennt durch ` · `)
4. **"made with ❤ for ✚"** – Ganz unten, mit rotem Herz und Rotkreuz-SVG

```tsx
<footer className="text-center py-10 mt-8 border-t" style={{ borderColor: 'var(--border)' }}>
  <div className="text-sm font-bold uppercase tracking-widest mb-2"
       style={{ color: 'var(--drk)' }}>
    Deutsches Rotes Kreuz
  </div>
  <div className="text-sm mb-3" style={{ color: 'var(--text-light)' }}>
    Kreisverband StädteRegion Aachen e.V.
  </div>
  <div className="text-xs mb-3" style={{ color: 'var(--text-light)' }}>
    <Link href="/impressum">Impressum</Link> ·
    <Link href="/datenschutz">Datenschutz</Link> ·
    <Link href="/hilfe">Hilfe</Link> ·
    <Link href="/spenden">Unterstützen</Link>
  </div>
  <div className="text-xs flex items-center justify-center gap-1"
       style={{ color: 'var(--text-light)' }}>
    made with <span style={{ color: 'var(--drk)' }}>❤</span> for
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" fill="#e30613"/>
    </svg>
  </div>
</footer>
```

**WICHTIG:** Der Footer ist NICHT dunkelgrau! Er hat einen weißen/hellen Hintergrund mit dezenter oberer Borderlinie.

### Hauptseiten-Layout (Box-basiert)

- Container: `max-w-4xl mx-auto` (oder `max-w-2xl` für schmale Seiten)
- Box-Karten: `.drk-card` Klasse (weiß, rounded-xl, shadow-lg, padding)
- Seitenhintergrund: `var(--bg)` (leichtes Grau)
- Abstände zwischen Boxen: `space-y-6`

```tsx
<div className="py-8 px-4">
  <div className="max-w-4xl mx-auto space-y-6">
    <div className="drk-card">
      <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--text)' }}>
        Überschrift
      </h2>
      <p style={{ color: 'var(--text-light)' }}>Beschreibung...</p>
    </div>
  </div>
</div>
```

### Buttons

- Primär: `.drk-btn-primary` (Rot, weiß, font-semibold, rounded, min-height 44px)
- Sekundär: `.drk-btn-secondary` (Grau)
- Mindesthöhe 44px für Touch-Targets

### Formulare

- Labels: `.drk-label` (bold, dunkel)
- Inputs: `.drk-input` (border, rounded, focus-ring in Rot)
- Validierung in Rot darunter

### Typografie

- System-Font-Stack (kein externes Font-Loading)
- Überschriften: `font-bold`, Farbe `var(--text)`
- Fließtext: Farbe `var(--text-light)`
- Hinweise: `text-sm`, Farbe `var(--text-muted)`

---

## UX-Prinzipien

### 1. Einfachheit über Funktionalität
- Jeder Bildschirm: EINE klare Aufgabe
- Max 3-5 Aktionen pro Ansicht
- Wizard-Pattern für mehrstufige Prozesse

### 2. Mobile First
- Touch-Ziele mindestens 44x44px
- Bottom-Sheets statt Modals auf Mobile
- Kein Hover-only-Content

### 3. Sofort nutzbar
- Kein Login/Registrierung wo vermeidbar
- Selbsterklärende UI
- Hilfe-Texte inline

### 4. Fehlertoleranz
- Exit-Guard (beforeunload) bei ungespeicherten Daten
- localStorage-Zwischenspeicherung wo sinnvoll
- Fehlermeldungen auf Deutsch

---

## Zweisprachigkeit (i18n)

Jede App soll DE und EN unterstützen über `lib/i18n.ts`.

- Standard: Deutsch
- Umschaltung: Button im Header oder Footer (DE | EN)
- Alle sichtbaren Texte über i18n-Keys

---

## Pflicht-Seiten

### Impressum (`/impressum`)
DRK KV Aachen Kontaktdaten, Vertretung, Registergericht.

### Datenschutz (`/datenschutz`)
Verantwortlicher, keine Cookies, keine externen Dienste, Betroffenenrechte.

### Hilfe (`/hilfe`)
FAQ mit `<details>`-Elementen, Kontakt-Box. Erreichbar über ❓-SVG-Icon im Header.

### Spenden (`/spenden`)
- Erreichbar über ❤-SVG-Icon im Header (links neben Hilfe)
- Warmherziger Dank an Nutzer
- Hinweis auf ehrenamtliche/kostenlose/Open-Source-Entwicklung
- DRK-Arbeit kurz beschreiben
- Spenden-Optionen: Online (Link), Überweisung (Bankverbindung), Fördermitgliedschaft
- Optional: QR-Code für schnelle Spende
- Tonalität: Dankbar, nicht aufdringlich

---

## README.md (Pflicht für GitHub)

Jede App MUSS eine README.md haben. Format orientiert sich an den Referenz-Apps und enthält mindestens:

1. **Titel** mit Emoji + Kurzbeschreibung + Tagline (Open Source · Kostenlos · DSGVO-konform)
2. **Was ist das?** – Problem und Zielgruppe in 2-3 Sätzen
3. **Features** – Web-App Features + ggf. REST-API
4. **Installation** – Docker ODER statisch ODER lokal
5. **Tech-Stack** – Next.js 16, React 19, TypeScript, Tailwind CSS 4
6. **Projektstruktur** – Ordner/Datei-Baum
7. **Datenschutz & Sicherheit** – Keine DB, keine Cookies, Open Source
8. **Beitragen** – Fork → Branch → Commit → PR
9. **Lizenz** – MIT
10. **Über** – DRK KV Aachen + "Gebaut mit ❤️ für das Deutsche Rote Kreuz"

Für das exakte Format: READMEs in https://github.com/AFielen/abstimmung und https://github.com/AFielen/auskunft als Vorlage nutzen.

**PFLICHT – README aktuell halten:**
- README.md MUSS aktualisiert werden wenn sich Features, Projektstruktur oder Installation ändern
- **Feature-Liste** (`## ✨ Features`) bei neuen oder entfernten Features anpassen
- **"Enthalten"-Tabelle** aktualisieren bei neuen Seiten oder Komponenten
- **Installationsanleitung** prüfen wenn sich Deployment, Dependencies oder Konfiguration ändern
- **Tech-Stack** nur anpassen wenn sich Major-Versionen oder Technologien ändern

---

## DSGVO-Checkliste

- [ ] Keine externen Requests an US-Dienste (siehe INFRASTRUCTURE.md)
- [ ] Keine Cookies
- [ ] Keine Datenbank wo vermeidbar
- [ ] Hosting gemäß Goldstandard (INFRASTRUCTURE.md)
- [ ] `/impressum` vorhanden
- [ ] `/datenschutz` vorhanden (mit tatsächlich genutzten Diensten)
- [ ] `/hilfe` vorhanden
- [ ] `/spenden` vorhanden
- [ ] XSS-Schutz
- [ ] Fonts lokal / System-Stack
- [ ] README.md nach Format

---

## Code-Konventionen

### TypeScript
- `strict: true`, keine `any`
- Interfaces für Props, Types für Unions
- Function Components only

### Dateibenennungen
- Komponenten: `PascalCase.tsx`
- Hooks: `use*.ts`
- Utils: `kebab-case.ts`
- Pages: `page.tsx`

### Commits
- `feat:` / `fix:` / `docs:` / `style:` / `refactor:`

### Changelog (`CHANGELOG.md`)

**PFLICHT:** Bei **jeder** Code-Änderung MUSS die `CHANGELOG.md` aktualisiert werden.

- Format: [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
- Einträge **immer** unter `## [Unreleased]` im passenden Abschnitt:
  - **Added** — Neue Features, Seiten, Komponenten, CSS-Klassen
  - **Changed** — Änderungen an bestehendem Verhalten, Refactorings
  - **Fixed** — Bugfixes
  - **Removed** — Entfernte Features oder Dateien
- Einträge **kurz und technisch**: Dateinamen, CSS-Klassen, Funktionen nennen
- Keine leeren Abschnitte — nur Kategorien nutzen die auch Einträge haben
- Bei Release: `## [Unreleased]` → `## [X.Y.Z] – YYYY-MM-DD`

---

## Skills

### PostgreSQL & Drizzle (`/drk-postgres`)

Für alle Apps mit Variante B (Server + Datenbank).
Aufruf: `/drk-postgres [thema]` — z.B. `/drk-postgres schema`, `/drk-postgres rls`, `/drk-postgres migration`

Referenz-Dateien: `skills/drk-postgres-skill/references/`
Skill-Definition: `.claude/skills/drk-postgres/SKILL.md`

---

## Kontakt

DRK Kreisverband StädteRegion Aachen e.V.
Henry-Dunant-Platz 1, 52146 Würselen
E-Mail: Info@DRK-Aachen.de
Web: https://www.drk-aachen.de
