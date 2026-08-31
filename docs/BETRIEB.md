# Betriebshandbuch – DRK Hinweisgebersystem

Kompaktes Handbuch für Einrichtung und laufenden Betrieb. Infrastruktur-Vorgaben (Hetzner, Mailjet, Backup-Goldstandard): siehe `INFRASTRUCTURE.md`.

---

## 1. Erst-Setup

1. **Umgebungsvariablen** — `.env` aus `.env.example` erstellen und alle Pflichtwerte setzen:
   - `DB_PASSWORD` — Datenbank-Passwort
   - `JWT_SECRET` — min. 32 Zeichen, zufällig
   - `ENCRYPTION_KEY` — `openssl rand -base64 32` (siehe Abschnitt 3!)
   - `SETUP_TOKEN` — Einmal-Token für den Seed, zufällig
   - `NEXT_PUBLIC_APP_URL` — öffentliche URL
   - optional `MAILJET_API_KEY`, `MAILJET_SECRET_KEY`, `MAIL_FROM` — ohne diese Werte bleibt der E-Mail-Versand deaktiviert, das System funktioniert trotzdem
2. **Start** — `docker compose up -d`. Migrationen laufen automatisch vor dem App-Start (`scripts/migrate.mjs`).
3. **Seed** — ersten Admin-Account anlegen (nur solange keine Benutzer existieren):
   ```bash
   curl -X POST https://<domain>/api/admin/seed -H "x-setup-token: <SETUP_TOKEN>"
   ```
   Die Antwort enthält das **einmalig** generierte Admin-Passwort — sofort sicher notieren.
4. **Erster Login** — unter `/login` anmelden und unter `/admin/benutzer` → „Eigenes Passwort ändern" ein neues Passwort setzen.
5. **Mandanten & Benutzer anlegen** — unter `/admin/kunden` die Organisationen (Mandanten) anlegen, dann unter `/admin/benutzer` die Bearbeiter-Accounts: Rolle `admin` (sieht alles, verwaltet Benutzer) oder `user` mit Kunden-Zuordnung (sieht per Row-Level-Security nur die Fälle der eigenen Organisation).
6. **Wichtig:** Der Datenbank-Benutzer der App darf **kein Superuser** sein und **kein `BYPASSRLS`** haben, sonst greift die Mandantentrennung nicht. Das mitgelieferte Docker-Setup (User `drk`) erfüllt das.

## 2. Backup (gemäß INFRASTRUCTURE.md)

Zu sichern sind **zwei** Dinge: die PostgreSQL-Datenbank und das Upload-Volume (Anhänge).

- **Täglicher `pg_dump`** auf die Hetzner Storage Box (räumlich getrennter Standort), Retention 7 Tage / 4 Wochen / 3 Monate.
- **`uploads`-Volume** (Docker-Volume, im Container `/app/uploads`) mitsichern — z. B. per restic/borgbackup oder rsync auf die Storage Box.

Beispiel-Cron (auf dem Host, Storage Box per SSH/rsync eingerichtet):

```cron
# Täglich 02:30 – DB-Dump + Anhänge auf Hetzner Storage Box
30 2 * * * docker compose -f /opt/hinschg/docker-compose.yml exec -T db pg_dump -U drk hinweisgebersystem | gzip > /var/backups/hinschg/db-$(date +\%F).sql.gz && rsync -a --delete /var/lib/docker/volumes/hinschg_uploads/_data/ /var/backups/hinschg/uploads/ && rsync -a /var/backups/hinschg/ u12345@u12345.your-storagebox.de:hinschg/
```

- **Restore regelmäßig testen:** Ein Backup, das nie zurückgespielt wurde, ist keins. Mindestens quartalsweise einen Dump in eine leere Test-Datenbank einspielen (`gunzip -c db-….sql.gz | psql -U drk hinweisgebersystem`) und stichprobenhaft prüfen, ob ein Fall inkl. Anhang lesbar ist.
- Die `.env` (insbesondere `ENCRYPTION_KEY`!) gehört **nicht** ins selbe Backup wie die Datenbank — getrennt sichern (Abschnitt 3).

## 3. Schlüsselverwaltung

- **`ENCRYPTION_KEY` ist kritisch:** Die Personendaten der Hinweisgeber sind damit AES-256-GCM-verschlüsselt. **Geht der Schlüssel verloren, sind diese Daten unwiederbringlich unlesbar** — auch mit intaktem Datenbank-Backup. Den Schlüssel daher an mindestens zwei sicheren, getrennten Orten hinterlegen (z. B. Passwort-Manager des Verbands + versiegelter Umschlag/Tresor), getrennt vom Datenbank-Backup.
- **`JWT_SECRET`-Rotation:** Kann jederzeit geändert werden (neuer Wert + Container-Neustart). Folge: Alle laufenden Sessions werden ungültig, alle Bearbeiter müssen sich neu anmelden — sinnvoll z. B. nach Verdacht auf Token-Diebstahl. Auf Postfach-Zugangscodes hat das keinen Einfluss (bcrypt-gehasht in der DB).
- **`SETUP_TOKEN`** wird nach der Ersteinrichtung nicht mehr benötigt; die Seed-Route verweigert ohnehin, sobald Benutzer existieren.

## 4. Monitoring

- **`GET /api/health`** — liefert Status, Version und Timestamp; als Check in Uptime Kuma (siehe INFRASTRUCTURE.md) einbinden.
- **Logs:** `docker compose logs -f app` (App inkl. Hintergrund-Jobs und Migrationslauf), `docker compose logs db`, `docker compose logs caddy`.
- **Systemprotokoll:** Logins, Fehlversuche und Benutzer-/Seed-Ereignisse sind für Admins unter `/api/admin/protokoll` bzw. in der Admin-Oberfläche einsehbar.

## 5. Löschjob & Fristen

Läuft automatisch im App-Prozess (gestartet über `instrumentation.ts`, Prüfintervall 15 Minuten, tägliche Ausführung) — **kein externer Cron nötig**:

- **Löschjob (§ 11 Abs. 5 HinSchG):** Fälle werden 3 Jahre nach Abschluss automatisch gelöscht (Datenbank-Zeilen + Anhang-Dateien). Zurück bleibt nur ein inhaltsfreier Eintrag im **Löschprotokoll** (Tabelle `loeschprotokoll`, im Admin einsehbar).
- **Fristen-Erinnerungen:** Für die 7-Tage-Eingangsbestätigung und die 3-Monats-Rückmeldung werden Erinnerungs-Aufgaben erzeugt; Überfälliges zeigt die Fristen-Ampel im Dashboard.
- **E-Mail-Queue:** Wird vom selben Job-Runner abgearbeitet (nur bei konfiguriertem Mailjet).

Voraussetzung: Es läuft genau **eine** App-Instanz (Single-Container-Betrieb, siehe docker-compose.yml).

## 6. Update-Prozedur

```bash
cd /opt/hinschg
git pull
docker compose build app
docker compose up -d
```

- Migrationen laufen beim Container-Start automatisch; kein manueller Schritt nötig.
- Vor Updates mit Datenbank-Migrationen: aktuelles Backup sicherstellen (Abschnitt 2).
- Kontrolle nach dem Update: `docker compose logs app | tail` (Migration „erfolgreich abgeschlossen"?) und `GET /api/health` (Version).
