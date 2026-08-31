import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { hinweise, archiv } from '@/lib/db/schema';
import { withTenant } from '@/lib/db/tenant';
import { verifyPassword } from '@/lib/auth/password';
import {
  createPostfachToken,
  POSTFACH_COOKIE_NAME,
  POSTFACH_COOKIE_OPTIONS,
} from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

const FEHLER_GENERISCH = 'Aktenzeichen oder Zugangscode ist falsch.';

const loginSchema = z.object({
  aktenzeichen: z.string().min(1).max(50),
  zugangscode: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // Rate-Limit: 10 Versuche / 15 Minuten pro IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const limit = rateLimit(`postfach:${ip}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    });
    if (!limit.ok) {
      return NextResponse.json(
        { error: 'Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.' },
        {
          status: 429,
          headers: { 'Retry-After': String(limit.retryAfterSeconds) },
        },
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: FEHLER_GENERISCH }, { status: 401 });
    }

    const aktenzeichen = parsed.data.aktenzeichen.trim().toUpperCase();
    const zugangscode = parsed.data.zugangscode.trim().toUpperCase();

    const hinweis = await withTenant('all', async (tx) => {
      const [row] = await tx
        .select({ id: hinweise.id, zugangscodeHash: hinweise.zugangscodeHash })
        .from(hinweise)
        .where(eq(hinweise.aktenzeichen, aktenzeichen))
        .limit(1);
      return row ?? null;
    });

    // Immer generische Antwort — kein Unterschied, ob das Aktenzeichen existiert
    const gueltig = hinweis?.zugangscodeHash
      ? await verifyPassword(zugangscode, hinweis.zugangscodeHash)
      : false;

    if (!hinweis || !gueltig) {
      return NextResponse.json({ error: FEHLER_GENERISCH }, { status: 401 });
    }

    await withTenant('all', async (tx) => {
      await tx.insert(archiv).values({
        hinweisId: hinweis.id,
        art: 'Log',
        ersteller: 'System',
        meldung: 'Postfach-Anmeldung',
      });
    });

    const token = await createPostfachToken(hinweis.id);
    const response = NextResponse.json({ success: true });
    response.cookies.set(POSTFACH_COOKIE_NAME, token, POSTFACH_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    console.error('POST /api/public/postfach/login error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
