# 🏥 DRK App Template

**Starter-Template für alle DRK-Digitalisierungstools.**

Open Source · Kostenlos · DSGVO-konform

---

## Was ist das?

Dieses Repository ist der Ausgangspunkt für neue Web-Apps im DRK-Kontext. Es enthält das einheitliche Design-System, die Projektstruktur und alle Konventionen – damit jede neue App vom ersten Moment an wie eine DRK-App aussieht und funktioniert.

## ✨ Features

* **DRK-Header + Footer** — Rote Leiste mit Logo, Hilfe- und Spenden-Icons
* **Box-basiertes Layout** — Konsistente Karten-Optik auf grauem Hintergrund
* **Zweisprachig (DE/EN)** — i18n-System von Tag 1
* **Pflichtseiten** — Impressum, Datenschutz, Hilfe, Spenden fertig eingebaut
* **CLAUDE.md** — Claude Code kennt sofort alle Konventionen
* **Flexibles Deployment** — Statisch (GitHub Pages) oder Server (Docker)
* **DSGVO-konform** — Keine Cookies, keine externen Dienste, keine Tracker

## 🚀 Schnellstart

### Neues Projekt erstellen

1. Auf GitHub: **"Use this template"** → "Create a new repository"
2. Repository-Name wählen (z.B. `drk-rundlauf`, `drk-protokoll`)
3. Klonen und loslegen:

```bash
git clone https://github.com/AFielen/[neuer-name].git
cd [neuer-name]
npm install
npm run dev
```

### Mit Claude Code entwickeln

```bash
# Im Projektverzeichnis – Claude liest CLAUDE.md automatisch:
claude
```

### Anpassen

1. **Suche & Ersetze** `APP_TITEL` → tatsächlicher App-Name
2. **Suche & Ersetze** `APP_BESCHREIBUNG` → Beschreibung
3. **Logo-Dateien** in `public/` ergänzen (logo.svg, logo.png, favicon.svg)
4. **`lib/i18n.ts`** mit app-spezifischen Übersetzungen erweitern
5. **`next.config.ts`** → `'export'` (statisch) oder `'standalone'` (Server)
6. **README.md** nach dem Pflicht-Format anpassen (siehe CLAUDE.md)

## 🛠️ Tech-Stack

* [Next.js 16](https://nextjs.org/) + [React 19](https://react.dev/)
* [TypeScript](https://www.typescriptlang.org/)
* [Tailwind CSS 4](https://tailwindcss.com/)

## 📐 Enthalten

| Datei | Zweck |
|---|---|
| `CLAUDE.md` | Konventionen für Claude Code |
| `app/layout.tsx` | DRK-Header (❓ Hilfe + ❤️ Spenden) + Footer |
| `app/globals.css` | DRK-Farben, Box-Klassen, Button-Styles |
| `app/page.tsx` | Beispiel-Startseite |
| `app/impressum/` | Impressum |
| `app/datenschutz/` | Datenschutzerklärung |
| `app/hilfe/` | Hilfe & FAQ |
| `app/spenden/` | Spenden-/Unterstützungsseite |
| `app/not-found.tsx` | Custom 404 |
| `lib/i18n.ts` | Zweisprachigkeit DE/EN |

## 🔗 Referenz-Apps

* [abstimmung](https://github.com/AFielen/abstimmung) — Digitales Abstimmungssystem
* [auskunft](https://github.com/AFielen/auskunft) — Digitale Compliance-Selbstauskunft

## 📄 Lizenz

MIT — Frei verwendbar für alle DRK-Gliederungen und darüber hinaus.

## 🏥 Über

Ein Projekt des [DRK Kreisverband StädteRegion Aachen e.V.](https://www.drk-aachen.de/)

---

*Gebaut mit ❤️ für das Deutsche Rote Kreuz*
