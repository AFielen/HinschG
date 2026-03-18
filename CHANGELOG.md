# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

---

## [Unreleased]

### Added
- Claude Code Skill `/drk-postgres` für PostgreSQL 16 & Drizzle ORM Best Practices (`.claude/skills/drk-postgres/SKILL.md`)
- Skills-Abschnitt in `CLAUDE.md` mit Verweis auf `/drk-postgres` Slash-Command
- `ThemeToggle`-Komponente (`components/ThemeToggle.tsx`): Light/Dark/System-Umschaltung mit Sonne/Mond/Monitor-Icons
- `Header`-Komponente (`components/Header.tsx`): Client-Component mit ThemeToggle, responsive Padding und Textgrößen
- Theme-Persistence-Script im `<head>` verhindert Flash of unstyled content beim Laden
- Neue CSS-Variablen: `--warning-border`, `--warning-text`, `--info-border`, `--info-text`, `--error`, `--error-bg`, `--error-border`, `--error-text`
- Dark-Mode Input/Select-Styling für `html.dark` und System-Fallback
- Print-Styles: Header, Footer und Buttons werden beim Drucken ausgeblendet, Cards brechen nicht um
- Bottom-Sheet-Animationen (`.drk-sheet-enter`, `.drk-backdrop-enter`) als Template-Pattern
- `favicon.svg` (Rotes Kreuz auf rotem Hintergrund) in `public/`
- `CHANGELOG.md` erstellt
- Skip-to-Content-Link für Tastaturnavigation im Root-Layout
- `aria-label` auf allen Header-Buttons und Logo-Link für Screen-Reader
- `aria-hidden="true"` auf allen dekorativen Emojis und SVG-Icons
- `focus-visible`-Styles für Links, Buttons und interaktive Elemente (nicht nur `<details>`)
- `.drk-summary` CSS-Klasse für FAQ-Elemente mit 44px Touch-Target
- `prefers-reduced-motion` Media-Query: Animationen werden bei Bedarf deaktiviert
- Per-Page Metadata-Exports für SEO (Impressum, Datenschutz, Hilfe, Spenden, 404)
- Icon-Komponenten extrahiert: `components/icons/` (HelpIcon, HeartIcon, RedCrossIcon)
- `app/loading.tsx` Skeleton-Loading-State als Template-Pattern
- Dark Mode CSS-Vorbereitung via `prefers-color-scheme: dark` (nur CSS-Variablen, kein UI-Toggle)
- Neue CSS-Variablen: `--bg-secondary`, `--bg-secondary-hover`, `--warning-dark`

### Changed
- Dark Mode von `@media (prefers-color-scheme: dark) :root` auf class-basiert (`html.dark`) mit System-Fallback (`html:not(.light)`)
- Header responsive verbessert: `px-3 sm:px-6`, `text-[1.1rem] sm:text-[1.4rem]`, `min-w-0` + `truncate` für Overflow
- Header aus `layout.tsx` in eigene Client-Component `Header.tsx` extrahiert (für ThemeToggle)
- `<html>` Tag mit `suppressHydrationWarning` für Theme-Script-Kompatibilität
- `CLAUDE.md`: Changelog-Abschnitt als eigene `###`-Section mit detaillierten Regeln formatiert
- `CLAUDE.md`: README-Pflege-Regel ergänzt (Features, Enthalten-Tabelle, Installation aktuell halten)
- Alle Pflichtseiten (Impressum, Datenschutz, Hilfe, Spenden, 404) nutzen jetzt konsequent CSS-Variablen statt Tailwind-Hardcoded-Farben (`bg-gray-50`, `text-gray-900` etc.)
- Impressum vervollständigt: Telefonnummer, Vorstandsname, Umsatzsteuer-ID, Registernummer, Haftungsausschluss
- Datenschutzerklärung erweitert auf 9 nummerierte Abschnitte (Hosting-Platzhalter, Änderungshinweis etc.)
- Hilfe-Seite: Kontakt-E-Mail auf `digitalisierung@drk-aachen.de` aktualisiert, erweiterte Kontaktbox
- Header-Subtitle responsive: Langversion ab `sm:`, Kurzversion auf Mobile
- `tsconfig.json`: `jsx` auf `react-jsx` aktualisiert, `.next/dev/types/**/*.ts` in `include` ergänzt
- `page.tsx`: Alle hardcoded Tailwind-Farben durch CSS-Variablen ersetzt
- `hilfe/page.tsx`: FAQ-Summaries nutzen `.drk-summary`-Klasse statt Inline-Hover-Farben
- `.drk-btn-secondary` und `.drk-badge-warning`: Hardcoded Farbwerte durch CSS-Variablen ersetzt
- `.drk-input:focus` → `.drk-input:focus-visible` (kein Outline bei Mausklick)
- Logo im Header: `<img>` → Next.js `<Image>` mit `priority`-Prop
- `next.config.ts`: `images: { unoptimized: true }` für statischen Export

---

## [1.0.0] – 2026-03-03

### Added
- Initiales DRK App-Template mit Next.js 16, React 19, TypeScript strict, Tailwind CSS 4
- DRK Design-System: CSS-Variablen, Utility-Klassen (`.drk-card`, `.drk-btn-primary` etc.)
- Pflichtseiten: Impressum, Datenschutz, Hilfe, Spenden, 404
- i18n-System (DE/EN) mit shared + app-spezifischen Übersetzungen
- Root-Layout mit DRK-Header (rot) und Footer (hell)
- Animationen: `.drk-fade-in`, `.drk-slide-up`
- Status-Badges: `.drk-badge-success`, `.drk-badge-warning`, `.drk-badge-error`
