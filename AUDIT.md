# Audit: DRK Hinweisgebersystem (HinSchG)

**Stand:** 31.08.2026 · **Codestand:** v1.0.0 (Commit `d369fc1`, 18.03.2026) · **Methode:** automatisierte Vollanalyse (Frontend, Backend, Datenbank, Doku) mit Stichproben-Verifikation

---

## Zusammenfassung

Das Repo enthält deutlich mehr als ein Grundgerüst: Datenbankschema, 26 API-Routen, zwei funktionierende Melde-Wizards und ein komplettes Admin-Layout sind da. Aber der Eindruck „vollständiges System" täuscht. Die Meldungsabgabe funktioniert — **alles, was danach kommt, ist entweder Attrappe oder fehlt**.

Die fünf schwerwiegendsten Punkte:

1. **Kein Rückkanal für Hinweisgeber.** Das Aktenzeichen wird einmal angezeigt und ist danach nutzlos — kein Postfach, keine Statusabfrage, keine Nachreichung. Damit sind § 16/17 HinSchG bei anonymen Meldungen technisch nicht erfüllbar.
2. **Keine Fristen- und Löschlogik.** 7-Tage-Eingangsbestätigung und 3-Monats-Rückmeldung existieren nur als Text auf der Website; die 3-Jahres-Löschfrist nach § 11 HinSchG hat weder Datenfeld noch Job.
3. **Offene Sicherheitslücken.** Die Seed-Route ist ohne Login erreichbar (legt `admin`/`admin123` an), die Middleware schützt `/api/admin/*` nicht, es gibt kein Rate-Limit, keine Verschlüsselung der Meldungsinhalte, und Port 3000 ist am TLS-Proxy vorbei offen.
4. **Admin-Oberfläche ist zu ~70 % Prototyp.** Hinweise-, Kunden-, Mitarbeiter- und E-Mail-Seiten zeigen hartkodierte Demo-Daten; viele Buttons tun nichts. Das E-Mail-System versendet keine einzige Mail (nodemailer wird nie importiert). Die zwei angebundenen Seiten (Dashboard, Aufgaben) crashen voraussichtlich an einem API-Format-Fehler.
5. **Rechtlich heikel: die Datenschutzerklärung ist falsch.** Sie behauptet „keine personenbezogenen Daten, keine Cookies, keine dauerhafte Speicherung" — das Gegenteil trifft zu. Zudem steht der Template-Platzhalter `APP_TITEL` noch sichtbar im Header jeder Seite.

Realistisch betrachtet ist das ein guter **Backend-Rohbau plus klickbarer UI-Prototyp** — brauchbar als Basis, aber vor einem Betrieb als gemeinsame interne Meldestelle sind die Phasen 1 und 2 der Roadmap zwingend.

## Lagebild

| Bereich | Status | Anmerkung |
|---|---|---|
| Meldungsabgabe | 🟢 funktioniert | Vertraulich & anonym, Wizard bis Aktenzeichen — aber nur für einen fest verdrahteten Mandanten |
| Datenbank & API | 🟡 weitgehend da | 10 Tabellen, 26 Routen mit Zod — aber keine Migrationen, FK-Bugs, keine Rollenprüfung |
| Admin-Oberfläche | 🟡 Prototyp | Nur Dashboard + Aufgaben angebunden (mit Crash-Bug); Rest Demo-Daten und tote Buttons |
| HinSchG-Compliance | 🔴 nicht umgesetzt | Kein Rückkanal, keine Fristen, kein Löschkonzept, keine Mandantentrennung |
| Sicherheit | 🔴 Lücken | Offene Seed-Route, kein Rate-Limit, keine Verschlüsselung at rest, TLS-Bypass möglich |
| Recht & Doku | 🔴 falsch/Platzhalter | Datenschutzerklärung sachlich falsch; Template-Platzhalter live; README übertreibt |

## Was vorhanden ist und funktioniert

### Öffentliche Meldestelle

- `/meldestelle` mit gut ausformulierten Infotexten und 7 FAQ-Einträgen zum HinSchG; alternative Meldewege (E-Mail, Telefon) benannt.
- Vertrauliche Meldung als 4-Schritt-Wizard, anonyme Meldung als 3-Schritt-Wizard. Beide senden erfolgreich an `POST /api/public/hinweis`: Aktenzeichen wird erzeugt, der Hinweis gespeichert, automatisch eine Prüf-Aufgabe („Eingangsbestätigung") und ein Protokolleintrag angelegt.
- Bei anonymer Meldung werden Personenfelder serverseitig konsequent genullt.

### Backend & Infrastruktur

- Vollständiges Drizzle-Schema: 10 Tabellen (users, kunden, kundengruppen, mitarbeiter, hinweise, aufgaben, archiv, email_konten, email_vorlagen, emails), 8 Enums, Relations und Indizes auf allen Fremdschlüsseln.
- 26 API-Route-Dateien mit 45 Endpunkten; CRUD für alle Entitäten, Zod-Validierung auf den mutierenden Routen, saubere Parametrisierung (keine SQL-Injection-Fläche).
- Login mit bcrypt (12 Runden), JWT über jose (24 h), httpOnly-Cookie; Middleware schützt alle `/admin`-Seiten mit Redirect zum Login.
- Docker-Setup (Multi-Stage, node:22-alpine) mit PostgreSQL 16 und Caddy als TLS-Proxy; DB-Port nicht öffentlich; `.env` sauber aus Git ausgeschlossen.
- Relevanzprüfung als erster Workflow-Schritt existiert im Backend (`POST /api/admin/aufgaben/[id]/entscheidung`).

### Sonstiges

- Echtes, vollständiges Impressum (Registernummer, USt-IdNr., Vertretung).
- DRK-Designsystem im Root-Layout korrekt umgesetzt (Header, Footer, CSS-Token, Dark Mode, Barrierefreiheits-Grundlagen wie Skip-Link und Fokus-Stile).
- Wiederverwendbare Admin-Komponenten (DataTable, StatusTabs, Formulare für Hinweis und Kunde) in ordentlicher Qualität.

## Befunde — Schwerpunkt 1: HinSchG- und DSGVO-Lücken

### 🔴 Kein Rückkanal / anonymes Postfach

Es gibt keine Route zur Statusabfrage, kein Hinweisgeber-Login per Aktenzeichen + Passwort, keine Möglichkeit zur Nachreichung und keine Nachrichten-Struktur in der Datenbank. Die anonyme Strecke sagt selbst: „keine Rückfragen möglich". Damit sind Eingangsbestätigung und Rückmeldung (§ 17 Abs. 1 und 2 HinSchG) gegenüber anonymen Hinweisgebern technisch unmöglich; § 16 Abs. 1 (Ermöglichung anonymer Kontaktaufnahme) ist nicht umgesetzt. Das Aktenzeichen wird zudem mit `Math.random()` erzeugt — nicht kryptografisch sicher und ohne Kollisionsbehandlung.

### 🔴 Keine Fristenlogik

Die 7-Tage- und 3-Monats-Fristen stehen als Text auf der Meldeseite und in einer Demo-Mailvorlage — im Code existiert nichts: Die automatisch angelegte Aufgabe bekommt kein Fälligkeitsdatum (`faelligBis` bleibt leer), es gibt keine Fristberechnung, keine Erinnerung, keine Eskalation und keinen einzigen automatischen Versand.

### 🔴 Kein Löschkonzept nach § 11 HinSchG

Keine Aufbewahrungs-/Löschfrist im Datenmodell, kein Löschjob, kein Cron. Die einzige Löschung ist das manuelle Löschen eines Hinweises durch einen Bearbeiter — und das vernichtet zugleich den kompletten Protokollverlauf (`archiv`-Einträge), also genau das, was die Dokumentationspflicht schützen soll.

### 🔴 Keine Mandantentrennung, keine Rollen

Als „gemeinsame Meldestelle" ist das System multi-mandantenfähig gedacht (`kundeId` auf allen relevanten Tabellen) — aber jeder eingeloggte Nutzer sieht alle Hinweise aller Organisationen inklusive Personendaten. Das Rollenfeld (`admin`/`user`) wird von keiner einzigen Route und keiner UI-Stelle ausgewertet. Row-Level-Security fehlt komplett, obwohl der repo-eigene Postgres-Skill sie für Multi-Tenant-Tabellen als kritisch vorschreibt. Für das Vertraulichkeitsgebot (§ 8 HinSchG) ist das die zentrale Lücke.

### 🔴 Keine Verschlüsselung, manipulierbares Protokoll

Meldungstext und Hinweisgeber-Personendaten liegen im Klartext in der Datenbank; nirgends im Code wird verschlüsselt. Das Protokoll (`archiv`) ist zusätzlich schwach: Der Verfasser eines Eintrags kann per API-Request frei gesetzt werden (`ersteller` aus dem Request-Body), und für Statuswechsel, Zuweisungen, Löschungen, Logins und Lesezugriffe wird gar nichts protokolliert.

### 🔴 Datenschutzerklärung sachlich falsch

`app/datenschutz/page.tsx` ist das unangepasste Template: „Es werden keine personenbezogenen Daten erhoben", „Keine Cookies", „keine dauerhafte Speicherung", Betroffenenrechte „nicht betroffen" — alles unzutreffend (PostgreSQL-Persistenz, Session-Cookie). Kein Wort zu HinSchG, Rechtsgrundlagen, Aufbewahrungsfristen oder zum Hosting; im Quelltext steht sogar noch ein Kommentar mit Cloudflare, einem laut INFRASTRUCTURE.md ausgeschlossenen Dienst. Für ein Hinweisgebersystem ist das der rechtlich heikelste Einzelbefund.

## Befunde — Schwerpunkt 2: Sicherheitslücken

### 🔴 Seed-Route ohne Authentifizierung

`POST /api/admin/seed` ist die einzige Admin-Route ohne Auth-Prüfung — die Middleware schützt nur `/admin`-Seiten, nicht `/api/admin/*`. Auf einer frischen Installation legt der erste beliebige Aufrufer den Admin-Account an, mit dem im README veröffentlichten Passwort `admin123`. Es gibt weder Passwort-Änderung noch Benutzerverwaltung in der App — weitere Ombudspersonen ließen sich nur per SQL anlegen.

### 🔴 Kein Rate-Limit, kein Missbrauchsschutz

Login und öffentliche Meldungsabgabe sind unbegrenzt aufrufbar: Credential-Stuffing und das Fluten der Meldestelle mit Massen-Meldungen (ohne Größenlimit auf dem Meldungstext) sind trivial möglich. Kein CAPTCHA, kein CSRF-Token (nur SameSite=lax), keine Sperre nach Fehlversuchen, kein Logout-seitiger Token-Widerruf (gestohlenes JWT bleibt 24 h gültig).

### 🔴 TLS-Bypass und fehlende Header

`docker-compose.yml` veröffentlicht den App-Port `3000:3000` direkt am Host — die App ist damit unverschlüsselt an Caddy vorbei erreichbar. Es fehlen Content-Security-Policy und HSTS (README behauptet CSP fälschlich als vorhanden). Der Container läuft als root.

### 🟡 Weitere Punkte

SMTP-Passwörter werden trotz Spaltenname `smtpPassEncrypted` unverschlüsselt gespeichert und per GET an jeden eingeloggten Nutzer ausgeliefert. Zod-Validierung ohne Längen-/Format-Grenzen (`.max()`, `.email()`, `.url()` fehlen), Validierungsdetails werden an den Client durchgereicht, HTML-Mailvorlagen sind eine gespeicherte XSS-Fläche, und `GET /api/public/kunden` gibt die komplette Kundenliste ungeschützt aus (wird vom Frontend nie genutzt).

## Befunde — Schwerpunkt 3: Funktionale Lücken und Bugs

Der augenfälligste Befund: **Backend und Frontend sind kaum miteinander verbunden.** Die APIs existieren, aber die meisten Admin-Seiten rufen sie nie auf.

| Bereich | Zustand |
|---|---|
| Hinweise / Kunden / Mitarbeiter | Listen und Detailseiten laufen auf hartkodierten Demo-Daten (`DEMO_DATA`, „Max Mustermann"), markiert mit `// TODO: fetch real data from API`. Lösch-Buttons sind Attrappen. |
| E-Mail-System | Reine Kulisse: Demo-Postfach, Senden-Button schließt nur das Modal (`// TODO: POST`), Vorlagen-Editor speichert nichts. nodemailer wird nirgends importiert, die Warteschlange nie abgearbeitet, die Mailjet-Umgebungsvariablen von keinem Code gelesen. |
| Dashboard / Aufgaben | Als einzige angebunden — aber mit vermutlichem Crash: Die APIs liefern `{data, total, …}`, die Seiten verarbeiten die Antwort direkt als Array (`.filter()` auf einem Objekt). Aufgaben-Detail ruft die nicht existierende Route `…/workflow` auf; die drei Aktions-Buttons haben keine Handler. Die Relevanzprüfungs-API wird vom Frontend nie aufgerufen. |
| Mandantenauswahl | Beide Melde-Wizards hardcoden „Kunde 1" als einzige Option — das Multi-Mandanten-Modell ist vom öffentlichen UI aus unerreichbar. |
| Datei-Upload | Fehlt vollständig; Hinweisgeber können keine Belege einreichen. Die Upload-Felder in den Admin-Formularen sind unverarbeitet. |
| Datenbank-Betrieb | Keine Migrationen (Ordner existiert nicht, nur `db:push`) und kein Schema-Schritt im Deployment — ein frisches `docker compose up` startet eine App ohne Tabellen. Löschen von Hinweisen/Kunden läuft wegen fehlender FK-Kaskaden in 500er-Fehler. |
| Kleinere Bugs | Sortieren setzt die Tabelle auf eine leere Seite 0; `export { KATEGORIEN }` aus einer page.tsx riskiert den Build-Typecheck; Exit-Guard warnt auch ohne Änderungen; Dashboard-Kennzahlen rechnen falsch (In-Zeit-Quote, Chart auf Änderungsdatum); Kategorienliste 4-fach dupliziert und serverseitig unvalidiert. |
| Qualitätssicherung | Keine Tests, keine CI, kein Lint (Script zeigt auf entferntes `next lint`), kein Backup-Konzept trotz Vorgabe in INFRASTRUCTURE.md. |

## Befunde — Schwerpunkt 4: Template-Reste und Dokumentation

- **Sichtbare Platzhalter:** Der Header jeder Seite zeigt wörtlich `APP_TITEL` / `APP_UNTERTITEL`; Browser-Titel aller Seiten lauten „DRK APP_TITEL". Die Startseite `/` ist das unveränderte Template („Dies ist ein Template. Passen Sie diese Seite an…") und verlinkt nicht einmal zur Meldestelle. Die Hilfe-Seite beantwortet „Werden meine Daten gespeichert?" mit „Nein."
- **i18n ist toter Code:** `lib/i18n.ts` (DE/EN) wird von keiner Datei importiert; alle Texte sind hartkodiert Deutsch, ein Sprachumschalter fehlt. PROJECT.md führt das korrekt als offen.
- **Design-Inkonsistenzen:** Meldestelle und Admin bringen eigene Farbwelten (Steel-Blue, Dunkelblau) als hartkodierte Hex-Werte mit; durch fehlende Route-Groups rendern dort doppelte Header und Footer (inkl. des laut Konvention verbotenen dunklen Footers); der Dark Mode ist auf der Meldestelle kaputt (dunkle Eingabefelder in fest weißen Karten).
- **Doku widerspricht dem Code:** README behauptet CSP und funktionierenden Mailversand; die Endpunkt-Zahlen stimmen nicht (tatsächlich 26 Dateien / 45 Handler); `DB_PASSWORD` fehlt in `.env.example`, wodurch die README-Installationsanleitung scheitert; API-INTEGRATION.md ist reines Template und behauptet gefährlicherweise „Authentifizierung: Keine"; PROJECT.md („In Entwicklung") und CHANGELOG („v1.0.0") widersprechen sich — PROJECT.md hat recht.
- **Konventionsverstöße gegen den eigenen Postgres-Skill:** durchgehend `serial` statt Identity-Spalten, ~60× `varchar(n)` statt `text`, keine RLS, App verbindet als Datenbank-Owner statt mit Minimalrechten.

## Roadmap in vier Phasen

Reihenfolge nach Risiko: Erst das, was rechtlich und sicherheitstechnisch brennt, dann die HinSchG-Kernfunktionen, dann Fertigbauen, dann Politur.

### Phase 1 — Sofortmaßnahmen: Sicherheit & Recht

*Ziel: Kein rechtliches oder sicherheitstechnisches Eigentor, bevor irgendetwas online geht. Umfang: klein, wenige Tage.*

- Seed-Route absichern (Setup-Token oder einmaliger CLI-Seed), Middleware auf `/api/admin/*` ausweiten, Passwort-Änderung + Benutzerverwaltung ergänzen, `admin123` aus dem README streichen.
- Rate-Limit auf Login und Meldungsabgabe, Größenlimits in der Validierung, Port-3000-Veröffentlichung entfernen, CSP + HSTS setzen, Container als Nicht-Root.
- Datenschutzerklärung komplett neu (HinSchG, Rechtsgrundlagen, Speicherdauer, Hetzner/Mailjet), Template-Platzhalter beseitigen (Header, Startseite, Hilfe, Titel).

### Phase 2 — HinSchG-Kernfunktionen

*Ziel: Das System erfüllt die gesetzlichen Pflichten einer internen Meldestelle. Umfang: der größte Block.*

- Anonymes Postfach: Zugangscode bei Meldungsabgabe (kryptografisch erzeugt, gehasht gespeichert), Statusseite, Zwei-Wege-Nachrichten samt Nachrichten-Tabelle und Nachreichung von Unterlagen.
- Fristen-Engine: 7-Tage- und 3-Monats-Fristen bei Eingang berechnen, im Dashboard mit Überfälligkeits-Ampel anzeigen, Erinnerungen versenden.
- Löschkonzept: Löschdatum pro Fall (3 Jahre nach Abschluss), täglicher Job, Löschung dokumentiert statt Audit-Trail vernichtend.
- Mandantentrennung + Rollen: Bearbeiter-Zuordnung je Organisation, Rollenprüfung in den Routen, Row-Level-Security nach dem eigenen Skill; Verschlüsselung der Personendaten at rest; Protokoll härten (Server setzt Verfasser, alle relevanten Ereignisse loggen).

### Phase 3 — Funktion fertigbauen

*Ziel: Aus dem Prototyp wird eine benutzbare Anwendung.*

- Alle Admin-Seiten an die vorhandenen APIs anbinden (Demo-Daten raus), tote Buttons verdrahten, API-Format-Crash und die übrigen Bugs beheben, fehlende Routen ergänzen.
- E-Mail-Versand real umsetzen (nodemailer/Mailjet + Queue-Worker), Eingangsbestätigung automatisch versenden, Mails mit Fällen verknüpfen.
- Organisationsauswahl im Melde-Wizard aus der Datenbank laden; Datei-Upload für Belege (Limits, Typen-Whitelist).
- Drizzle-Migrationen statt `db:push`, Migrationsschritt beim Container-Start, Workflow-Schritte nach der Relevanzprüfung ausbauen.

### Phase 4 — Politur & Betrieb

*Ziel: Konventionstreue, Wartbarkeit, Betriebssicherheit.*

- i18n aktivieren (öffentliche Seiten DE/EN mit Umschalter), Route-Groups gegen doppelte Header/Footer, Dark Mode der Meldestelle reparieren, Farbwelten in CSS-Variablen überführen.
- README/CHANGELOG/API-Doku korrigieren, `.env.example` vervollständigen, ungenutzte Abhängigkeiten aufräumen.
- Tests + CI, Backup-Konzept nach INFRASTRUCTURE.md, Reporting/Export (CSV/PDF) aus PROJECT.md.

## Hinweis: Mendix-Abgleich

Sobald die Mendix-Exportdatei des Altsystems im Repo liegt, lohnt ein Abgleich Altsystem ↔ Neubau: Welche Felder, Workflow-Schritte, Vorlagen und Auswertungen bildet das Mendix-System ab, die hier noch fehlen? Das schärft vor allem Phase 2 und 3 — insbesondere die Workflow-Schritte nach der Relevanzprüfung, die bisher nur angerissen sind.

---

*Automatisierte Code-Analyse des Repositories AFielen/HinschG (Branch main, Commit `d369fc1`) · erstellt mit Claude Code · 31.08.2026*
