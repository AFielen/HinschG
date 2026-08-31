import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, systemProtokoll } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/rate-limit';

/** Protokolliert einen Anmeldevorgang (ohne Passwort, ohne IP). */
async function protokolliere(
  ereignis: 'Login' | 'Login fehlgeschlagen',
  benutzer: string,
  details?: string,
): Promise<void> {
  try {
    await db.insert(systemProtokoll).values({
      ereignis,
      benutzer,
      details: details ?? null,
    });
  } catch (err) {
    // Protokollfehler dürfen die Anmeldung nicht verhindern
    console.error('systemProtokoll insert error:', err);
  }
}

const loginSchema = z.object({
  username: z.string().min(1, 'Benutzername ist erforderlich'),
  password: z.string().min(1, 'Kennwort ist erforderlich'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Ungültige Eingabe', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { username, password } = parsed.data;

    // Rate-Limit: 5 Versuche / 15 Minuten pro IP+Benutzername
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      'unknown';
    const limit = rateLimit(`${ip}:${username}`, {
      limit: 5,
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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user || !user.active) {
      await protokolliere(
        'Login fehlgeschlagen',
        username,
        user ? 'Konto deaktiviert' : 'Benutzer unbekannt',
      );
      return NextResponse.json(
        { error: 'Benutzername oder Kennwort ungültig' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      await protokolliere('Login fehlgeschlagen', username, 'Kennwort falsch');
      return NextResponse.json(
        { error: 'Benutzername oder Kennwort ungültig' },
        { status: 401 },
      );
    }

    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      kundeId: user.kundeId,
    });

    await protokolliere('Login', user.username);

    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
    });

    response.cookies.set('hinweis-session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 },
    );
  }
}
