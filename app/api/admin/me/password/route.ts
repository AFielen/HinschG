import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { requireAuth } from '@/lib/auth/middleware';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Aktuelles Kennwort ist erforderlich.'),
  newPassword: z
    .string()
    .min(12, 'Neues Kennwort muss mindestens 12 Zeichen lang sein.')
    .max(255),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth(request);
    const body = await request.json();
    const data = passwordSchema.parse(body);

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (!user || !user.active) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Aktuelles Kennwort ist falsch' },
        { status: 401 },
      );
    }

    const passwordHash = await hashPassword(data.newPassword);

    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/me/password error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
