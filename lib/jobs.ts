import { and, eq, isNull, lt, lte, ne, or } from 'drizzle-orm';
import { hinweise, aufgaben, emails } from './db/schema';
import { withTenant } from './db/tenant';
import { loescheHinweis } from './loeschung';
import { RUECKMELDUNG_ERINNERUNG_TAGE } from './fristen';

/**
 * Hintergrund-Jobs (Löschfristen, Fristen-Erinnerungen, E-Mail-Queue).
 * Gestartet über instrumentation.ts, Prüfintervall 15 Minuten.
 */

const INTERVALL_MS = 15 * 60 * 1000;
const TAG_MS = 24 * 60 * 60 * 1000;

// In-Memory-Tages-Guard: lastRun-Timestamps pro Job
const lastRun: Record<string, number> = {};

let started = false;

function istHeuteSchonGelaufen(job: string): boolean {
  const last = lastRun[job];
  if (!last) return false;
  return new Date(last).toDateString() === new Date().toDateString();
}

/**
 * Löscht Hinweise, deren Löschfrist (loeschenAm) abgelaufen ist.
 */
async function loeschJob(): Promise<void> {
  const now = new Date();

  const faellig = await withTenant('all', (tx) =>
    tx
      .select({ id: hinweise.id })
      .from(hinweise)
      .where(lte(hinweise.loeschenAm, now)),
  );

  for (const { id } of faellig) {
    const ok = await loescheHinweis(
      id,
      'Löschfrist § 11 Abs. 5 HinSchG abgelaufen',
    );
    if (ok) {
      console.log(`[Jobs] Hinweis ${id} nach Ablauf der Löschfrist gelöscht`);
    }
  }
}

/**
 * Legt Erinnerungs-Aufgaben für bald ablaufende Rückmeldefristen an.
 */
async function fristenErinnerungJob(): Promise<void> {
  const now = new Date();
  const erinnerungsGrenze = new Date(
    now.getTime() + RUECKMELDUNG_ERINNERUNG_TAGE * TAG_MS,
  );
  const wiedervorlage = new Date(now.getTime() - 7 * TAG_MS);
  const titel = 'Rückmeldefrist prüfen';

  await withTenant('all', async (tx) => {
    const betroffene = await tx
      .select({
        id: hinweise.id,
        aktenzeichen: hinweise.aktenzeichen,
        rueckmeldungFaelligAm: hinweise.rueckmeldungFaelligAm,
      })
      .from(hinweise)
      .where(
        and(
          ne(hinweise.status, 'Abgeschlossen'),
          isNull(hinweise.rueckmeldungAm),
          lt(hinweise.rueckmeldungFaelligAm, erinnerungsGrenze),
          or(
            isNull(hinweise.fristErinnerungAm),
            lt(hinweise.fristErinnerungAm, wiedervorlage),
          ),
        ),
      );

    for (const hinweis of betroffene) {
      const [offeneAufgabe] = await tx
        .select({ id: aufgaben.id })
        .from(aufgaben)
        .where(
          and(
            eq(aufgaben.hinweisId, hinweis.id),
            eq(aufgaben.titel, titel),
            eq(aufgaben.status, 'Offen'),
          ),
        )
        .limit(1);

      if (!offeneAufgabe) {
        const faelligText = hinweis.rueckmeldungFaelligAm
          ? hinweis.rueckmeldungFaelligAm.toLocaleDateString('de-DE')
          : 'unbekannt';
        await tx.insert(aufgaben).values({
          hinweisId: hinweis.id,
          titel,
          beschreibung:
            `Die Rückmeldefrist (§ 17 Abs. 2 HinSchG) für Meldung ` +
            `${hinweis.aktenzeichen} läuft am ${faelligText} ab. ` +
            `Bitte Rückmeldung an den Hinweisgeber prüfen.`,
          status: 'Offen',
        });
        console.log(
          `[Jobs] Erinnerung angelegt: Rückmeldefrist für ${hinweis.aktenzeichen}`,
        );
      }

      await tx
        .update(hinweise)
        .set({ fristErinnerungAm: now })
        .where(eq(hinweise.id, hinweis.id));
    }
  });
}

/**
 * E-Mail-Warteschlange abarbeiten — vorerst Stub der nur zählt und loggt.
 * Versand folgt in Phase 3.
 */
async function drainEmailQueue(): Promise<void> {
  const wartend = await withTenant('all', (tx) =>
    tx
      .select({ id: emails.id })
      .from(emails)
      .where(eq(emails.status, 'Warteschlange')),
  );

  if (wartend.length > 0) {
    console.log(
      `[Jobs] E-Mail-Queue: ${wartend.length} E-Mail(s) in Warteschlange (Versand folgt in Phase 3)`,
    );
  }
}

async function tick(): Promise<void> {
  if (!istHeuteSchonGelaufen('loeschJob')) {
    try {
      await loeschJob();
      lastRun['loeschJob'] = Date.now();
    } catch (err) {
      console.error('[Jobs] Löschjob fehlgeschlagen:', err);
    }
  }

  if (!istHeuteSchonGelaufen('fristenErinnerung')) {
    try {
      await fristenErinnerungJob();
      lastRun['fristenErinnerung'] = Date.now();
    } catch (err) {
      console.error('[Jobs] Fristen-Erinnerung fehlgeschlagen:', err);
    }
  }

  try {
    await drainEmailQueue();
  } catch (err) {
    console.error('[Jobs] E-Mail-Queue fehlgeschlagen:', err);
  }
}

/**
 * Startet die Hintergrund-Jobs (idempotent).
 */
export function startJobs(): void {
  if (started) return;
  started = true;

  console.log('[Jobs] Hintergrund-Jobs gestartet (Intervall: 15 Minuten)');

  // Erster Lauf kurz nach dem Start, danach alle 15 Minuten
  setTimeout(() => {
    void tick();
  }, 10 * 1000);

  setInterval(() => {
    void tick();
  }, INTERVALL_MS);
}
