import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { hinweise, aufgaben, archiv } from '@/lib/db/schema';
import { rateLimit } from '@/lib/rate-limit';

function generateAktenzeichen(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let rand = '';
  for (let i = 0; i < 8; i++) {
    rand += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${y}-${m}-${d}-${rand}`;
}

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
    const aktenzeichen = generateAktenzeichen();

    const [hinweis] = await db
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
        hinweisgeberAnrede: data.istAnonym ? null : (data.hinweisgeberAnrede ?? null),
        hinweisgeberVorname: data.istAnonym ? null : (data.hinweisgeberVorname ?? null),
        hinweisgeberNachname: data.istAnonym ? null : (data.hinweisgeberNachname ?? null),
        hinweisgeberTelefon: data.istAnonym ? null : (data.hinweisgeberTelefon ?? null),
        hinweisgeberEmail: data.istAnonym ? null : (data.hinweisgeberEmail || null),
        hinweisgeberAnmerkungen: data.istAnonym ? null : (data.hinweisgeberAnmerkungen ?? null),
      })
      .returning();

    await db.insert(aufgaben).values({
      hinweisId: hinweis.id,
      titel: 'Neue Meldung prüfen',
      beschreibung: `Eingegangene Meldung (${aktenzeichen}) sichten und Relevanz prüfen.`,
      status: 'Offen',
      schritt: 1,
      schrittName: 'Eingangsbestätigung',
    });

    await db.insert(archiv).values({
      hinweisId: hinweis.id,
      art: 'Log',
      ersteller: 'System',
      meldung: `Meldung eingegangen über ${data.meldeweg}. Aktenzeichen: ${aktenzeichen}`,
    });

    return NextResponse.json({ success: true, aktenzeichen }, { status: 201 });
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
