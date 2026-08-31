import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { hinweise, aufgaben, archiv, nachrichten } from '@/lib/db/schema';
import { withTenant } from '@/lib/db/tenant';
import { generateAktenzeichen, generateZugangscode } from '@/lib/aktenzeichen';
import { berechneFristen } from '@/lib/fristen';
import { encryptField } from '@/lib/crypto';
import { hashPassword } from '@/lib/auth/password';
import { rateLimit } from '@/lib/rate-limit';

const EINGANGSBESTAETIGUNG_TEXT =
  'Ihre Meldung ist bei der Meldestelle eingegangen. Diese Nachricht bestätigt den Eingang gemäß § 17 Abs. 1 HinSchG. Sie erhalten spätestens innerhalb von drei Monaten eine Rückmeldung über geplante oder ergriffene Maßnahmen. Über dieses Postfach können Sie jederzeit Rückfragen stellen und Unterlagen nachreichen.';

const MAX_AKTENZEICHEN_VERSUCHE = 5;

const hinweisSchema = z.object({
  istAnonym: z.boolean().default(false),
  kundeId: z.number({ coerce: true }),
  meldeweg: z.enum(['Hinweisgebersystem', 'Telefon', 'Email', 'Post']).default('Hinweisgebersystem'),
  kategorie: z.string().max(255).optional(),
  datumVerstoss: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Datum muss im Format JJJJ-MM-TT vorliegen.')
    .optional(),
  beteiligte: z.string().max(5000).optional(),
  meldungstext: z
    .string()
    .min(10, 'Bitte geben Sie einen Meldungstext ein (mindestens 10 Zeichen).')
    .max(50000),
  hinweisgeberAnrede: z.enum(['Frau', 'Herr']).optional(),
  hinweisgeberVorname: z.string().max(200).optional(),
  hinweisgeberNachname: z.string().max(200).optional(),
  hinweisgeberTelefon: z.string().max(50).optional(),
  hinweisgeberEmail: z.string().email().max(320).optional().or(z.literal('')),
  hinweisgeberAnmerkungen: z.string().max(2000).optional(),
});

/** Erkennt eine Unique-Constraint-Verletzung (PostgreSQL-Fehlercode 23505). */
function istUniqueVerletzung(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  if ((err as { code?: unknown }).code === '23505') return true;
  const cause = (err as { cause?: unknown }).cause;
  return (
    typeof cause === 'object' &&
    cause !== null &&
    (cause as { code?: unknown }).code === '23505'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Rate-Limit: 5 Meldungen / Stunde pro IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const limit = rateLimit(`hinweis:${ip}`, {
      limit: 5,
      windowMs: 60 * 60 * 1000,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Zu viele Meldungen in kurzer Zeit. Bitte versuchen Sie es später erneut.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) },
        },
      );
    }

    const body = await request.json();
    const data = hinweisSchema.parse(body);

    // Zugangscode wird NUR hier einmalig erzeugt und ausgegeben —
    // gespeichert wird ausschließlich der bcrypt-Hash.
    const zugangscode = generateZugangscode();
    const zugangscodeHash = await hashPassword(zugangscode);

    const now = new Date();
    const { eingangsbestaetigungFaelligAm, rueckmeldungFaelligAm } =
      berechneFristen(now);

    // Aktenzeichen mit Kollisions-Retry (max 5 Versuche, bei
    // Unique-Verletzung wird neu gewürfelt)
    let aktenzeichen = '';
    let gespeichert = false;

    for (
      let versuch = 0;
      versuch < MAX_AKTENZEICHEN_VERSUCHE && !gespeichert;
      versuch++
    ) {
      aktenzeichen = generateAktenzeichen();
      try {
        await withTenant('all', async (tx) => {
          const [hinweis] = await tx
            .insert(hinweise)
            .values({
              aktenzeichen,
              status: 'Neu',
              istAnonym: data.istAnonym,
              kundeId: data.kundeId,
              meldeweg: data.meldeweg,
              kategorie: data.kategorie ?? null,
              datumVerstoss: data.datumVerstoss ?? null,
              beteiligte: data.beteiligte ?? null,
              meldungstext: data.meldungstext,
              // PII verschlüsselt (AES-256-GCM), bei anonymer Meldung alles null
              hinweisgeberAnrede: data.istAnonym ? null : (data.hinweisgeberAnrede ?? null),
              hinweisgeberVorname: data.istAnonym ? null : encryptField(data.hinweisgeberVorname),
              hinweisgeberNachname: data.istAnonym ? null : encryptField(data.hinweisgeberNachname),
              hinweisgeberTelefon: data.istAnonym ? null : encryptField(data.hinweisgeberTelefon),
              hinweisgeberEmail: data.istAnonym ? null : encryptField(data.hinweisgeberEmail || null),
              hinweisgeberAnmerkungen: data.istAnonym ? null : encryptField(data.hinweisgeberAnmerkungen),
              zugangscodeHash,
              // Fristen nach HinSchG + automatische Eingangsbestätigung
              eingangsbestaetigungAm: now,
              eingangsbestaetigungFaelligAm,
              rueckmeldungFaelligAm,
            })
            .returning();

          // Auto-Eingangsbestätigung (§ 17 Abs. 1 HinSchG) ins Postfach
          await tx.insert(nachrichten).values({
            hinweisId: hinweis.id,
            richtung: 'AnHinweisgeber',
            inhalt: EINGANGSBESTAETIGUNG_TEXT,
            ersteller: 'System',
          });

          await tx.insert(aufgaben).values({
            hinweisId: hinweis.id,
            titel: 'Relevanzprüfung',
            beschreibung: `Eingegangene Meldung (${aktenzeichen}) sichten und Relevanz prüfen.`,
            status: 'Offen',
            schritt: 1,
            schrittName: 'Eingangsbestätigung',
            faelligBis: eingangsbestaetigungFaelligAm,
          });

          await tx.insert(archiv).values({
            hinweisId: hinweis.id,
            art: 'Log',
            ersteller: 'System',
            meldung: `Meldung eingegangen über ${data.meldeweg}. Aktenzeichen: ${aktenzeichen}`,
          });
        });
        gespeichert = true;
      } catch (err) {
        if (istUniqueVerletzung(err) && versuch < MAX_AKTENZEICHEN_VERSUCHE - 1) {
          continue; // Aktenzeichen-Kollision → neu würfeln
        }
        throw err;
      }
    }

    // Zugangscode wird NUR in dieser Response einmalig ausgegeben
    return NextResponse.json(
      { success: true, aktenzeichen, zugangscode },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      // Bewusst keine Details an den Client (öffentlicher Endpunkt)
      return NextResponse.json(
        { error: 'Ungültige Eingabe. Bitte prüfen Sie Ihre Angaben.' },
        { status: 400 },
      );
    }
    console.error('POST /api/public/hinweis error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
