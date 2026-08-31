# API-Referenz – DRK Hinweisgebersystem

REST-API der App. **Die API ist nicht offen zugänglich:** Alle Admin-Endpunkte verlangen eine Session (JWT im httpOnly-Cookie `hinweis-session`), das Postfach eine eigene Postfach-Session (Cookie `postfach-session`). Öffentlich ohne Authentifizierung sind nur die Meldungsabgabe, die Organisationsliste, die Login-Endpunkte und der Health-Check.

Alle Endpunkte liefern JSON. Mutierende Endpunkte validieren mit Zod (inkl. Längen-/Formatgrenzen).

---

## Öffentliche Endpunkte (`/api/public/*`, `/api/health`)

**Auth:** keine — bzw. Postfach-Cookie `postfach-session` (gesetzt durch `POST /api/public/postfach/login`).

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/health` | Health-Check: Status, Version, Timestamp (keine Auth) |
| GET | `/api/public/kunden` | Organisationsliste für die Melde-Wizards — bewusst nur `id` und `firma` |
| POST | `/api/public/hinweis` | Meldung abgeben (vertraulich/anonym); erzeugt Aktenzeichen + Zugangscode, berechnet HinSchG-Fristen, legt Eingangsbestätigung ins Postfach (vertraulich zusätzlich als E-Mail in die Queue) |
| POST | `/api/public/postfach/login` | Postfach-Anmeldung mit Aktenzeichen + Zugangscode; setzt Cookie `postfach-session` |
| POST | `/api/public/postfach/logout` | Postfach-Session beenden |
| GET | `/api/public/postfach` | Fall-Status, Nachrichten-Thread und Anhänge des eigenen Falls (Cookie) |
| POST | `/api/public/postfach/nachricht` | Nachricht des Hinweisgebers an die Meldestelle nachreichen (Cookie) |
| POST | `/api/public/postfach/anhang` | Anhang zum eigenen Fall hochladen — max. 10 MB, MIME-Whitelist (Cookie) |
| GET | `/api/public/postfach/anhang/[id]` | Eigenen Anhang herunterladen (Cookie) |

## Authentifizierung (`/api/auth/*`)

| Methode | Endpunkt | Zweck |
|---|---|---|
| POST | `/api/auth/login` | Login mit Benutzername/Passwort; setzt httpOnly-Cookie `hinweis-session` (JWT, 24 h) |
| POST | `/api/auth/logout` | Session-Cookie löschen |
| GET | `/api/auth/me` | Aktuelle Session abfragen (Benutzer, Rolle) |

## Admin-Endpunkte (`/api/admin/*`)

**Auth:** Session-Cookie `hinweis-session` (Middleware liefert sonst `401`). Alle Fall-Daten sind mandantengescoped (Row-Level-Security): Bearbeiter mit zugeordneter Organisation sehen nur deren Fälle. Mit **(admin)** markierte Endpunkte verlangen zusätzlich die Rolle `admin`.

### Ersteinrichtung

| Methode | Endpunkt | Zweck |
|---|---|---|
| POST | `/api/admin/seed` | Ersten Admin-Account anlegen — nur mit Header `x-setup-token` (Env `SETUP_TOKEN`) und nur solange keine Benutzer existieren; Antwort enthält das einmalig generierte Passwort |

### Dashboard

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/dashboard/stats` | KPI-Kennzahlen (Hinweise nach Status, Aufgaben) |
| GET | `/api/admin/dashboard/chart` | Zeitreihen-Daten für das Dashboard-Diagramm |
| GET | `/api/admin/dashboard/fristen` | Fristen-Ampel: überfällige und bald fällige HinSchG-Fristen |

### Hinweise & Anhänge

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/hinweise` | Hinweisliste mit Statusfilter, Pagination, Sortierung |
| POST | `/api/admin/hinweise` | Hinweis manuell erfassen (z. B. telefonische Meldung); liefert Aktenzeichen + Zugangscode |
| GET | `/api/admin/hinweise/[id]` | Hinweis-Detail inkl. Nachrichten-Thread, Anhängen, Fristen |
| PUT | `/api/admin/hinweise/[id]` | Hinweis bearbeiten (Status, Zuweisung, Felder); bei Abschluss wird das Löschdatum (§ 11) gesetzt |
| DELETE | `/api/admin/hinweise/[id]` | **(admin)** Dokumentierte Löschung: Fall + Anhänge werden vernichtet, inhaltsfreier Eintrag ins Löschprotokoll |
| POST | `/api/admin/hinweise/[id]/nachricht` | Antwort an den Hinweisgeber ins Postfach, optional als Rückmeldung nach § 17 Abs. 2 |
| GET | `/api/admin/hinweise/[id]/anhang` | Anhänge eines Hinweises auflisten |
| POST | `/api/admin/hinweise/[id]/anhang` | Anhang zu einem Hinweis hochladen (gleiche Limits wie öffentlich) |
| GET | `/api/admin/anhaenge/[id]` | Anhang herunterladen |

### Aufgaben & Workflow

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/aufgaben` | Aufgabenliste (Workflow-Schritte, Fälligkeiten) |
| GET | `/api/admin/aufgaben/[id]` | Aufgaben-Detail mit Fall-Kontext und Protokoll |
| PUT | `/api/admin/aufgaben/[id]` | Aufgabe bearbeiten (zuweisen, abschließen, Status) |
| POST | `/api/admin/aufgaben/[id]/entscheidung` | Relevanzprüfung entscheiden (relevant ja/nein) |
| POST | `/api/admin/aufgaben/[id]/protokoll` | Protokolleintrag zum Bearbeitungsschritt anlegen |

### Fall-Protokoll (Archiv)

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/archiv` | Protokollverlauf eines Hinweises lesen (`?hinweisId=`) |
| POST | `/api/admin/archiv` | Protokolleintrag ergänzen — der Verfasser wird serverseitig aus der Session gesetzt |

### Kunden (Mandanten) & Mitarbeiter

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/kunden` | Organisationsliste |
| POST | `/api/admin/kunden` | **(admin)** Organisation anlegen |
| GET | `/api/admin/kunden/[id]` | Organisations-Detail |
| PUT | `/api/admin/kunden/[id]` | **(admin)** Organisation bearbeiten |
| DELETE | `/api/admin/kunden/[id]` | **(admin)** Organisation löschen |
| GET | `/api/admin/kundengruppen` | Kundengruppen auflisten |
| POST | `/api/admin/kundengruppen` | **(admin)** Kundengruppe anlegen |
| GET | `/api/admin/mitarbeiter` | Mitarbeiter-Übersicht (mandantengescoped) |
| POST | `/api/admin/mitarbeiter` | **(admin)** Mitarbeiter anlegen |
| GET | `/api/admin/mitarbeiter/[id]` | Mitarbeiter-Detail |
| PUT | `/api/admin/mitarbeiter/[id]` | **(admin)** Mitarbeiter bearbeiten |
| DELETE | `/api/admin/mitarbeiter/[id]` | **(admin)** Mitarbeiter löschen |

### Benutzerverwaltung & Systemprotokoll

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/users` | **(admin)** Benutzerliste; Ausnahme `?zweck=zuweisung` (Bearbeiter-Auswahl) für alle eingeloggten Nutzer |
| POST | `/api/admin/users` | **(admin)** Benutzer anlegen (Rolle, Mandanten-Zuordnung) |
| PUT | `/api/admin/users/[id]` | **(admin)** Benutzer bearbeiten / deaktivieren / Passwort zurücksetzen |
| PUT | `/api/admin/me/password` | Eigenes Passwort ändern (jeder eingeloggte Benutzer) |
| GET | `/api/admin/protokoll` | **(admin)** Systemprotokoll: Logins, Fehlversuche, Benutzer-/Seed-Ereignisse |

### E-Mail (Queue & Vorlagen)

| Methode | Endpunkt | Zweck |
|---|---|---|
| GET | `/api/admin/emails` | E-Mail-Liste nach Tab (Eingang/Gesendet/Warteschlange), paginiert |
| POST | `/api/admin/emails` | E-Mail in die Versand-Warteschlange stellen (Versand durch den Queue-Worker via Mailjet) |
| GET | `/api/admin/emails/[id]` | E-Mail-Detail |
| PUT | `/api/admin/emails/[id]` | E-Mail bearbeiten (z. B. Entwurf/Queue-Status) |
| DELETE | `/api/admin/emails/[id]` | E-Mail löschen |
| GET | `/api/admin/email-vorlagen` | Vorlagenliste |
| POST | `/api/admin/email-vorlagen` | Vorlage anlegen |
| GET | `/api/admin/email-vorlagen/[id]` | Vorlagen-Detail |
| PUT | `/api/admin/email-vorlagen/[id]` | Vorlage bearbeiten |
| DELETE | `/api/admin/email-vorlagen/[id]` | Vorlage löschen |
| GET | `/api/admin/email-konten` | E-Mail-Konten auflisten (SMTP-Passwort wird nie ausgegeben) |
| POST | `/api/admin/email-konten` | E-Mail-Konto anlegen |
| DELETE | `/api/admin/email-konten/[id]` | E-Mail-Konto löschen |

---

## Rate-Limits

In-Memory-Rate-Limiter (Sliding Window, keine IP-Persistierung). Bei Überschreitung antwortet die API mit `429` und `Retry-After`:

| Endpunkt | Limit |
|---|---|
| `POST /api/auth/login` | 5 Versuche / 15 Minuten (pro IP + Benutzername) |
| `POST /api/public/postfach/login` | 10 Versuche / 15 Minuten (pro IP) |
| `POST /api/public/hinweis` | 5 Meldungen / Stunde (pro IP) |

## Fehlerverhalten

- Fehlertexte sind **bewusst generisch**: Login und Postfach-Login verraten nicht, ob Benutzername bzw. Aktenzeichen existieren; Validierungsdetails werden nicht an den Client durchgereicht.
- Nicht authentifizierte Aufrufe von `/api/admin/*` liefern `401` (JSON) aus der Middleware; fehlende Rolle `admin` liefert `403`.
- Objekte außerhalb des eigenen Mandanten-Scopes verhalten sich wie nicht vorhanden (`404`), da die Row-Level-Security fail-closed filtert.
