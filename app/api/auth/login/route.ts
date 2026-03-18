import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyPassword } from '@/lib/auth/password';
import { createToken } from '@/lib/auth/jwt';

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

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!user || !user.active) {
      return NextResponse.json(
        { error: 'Benutzername oder Kennwort ungültig' },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Benutzername oder Kennwort ungültig' },
        { status: 401 },
      );
    }

    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

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
