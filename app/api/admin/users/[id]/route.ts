import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, kunden, systemProtokoll } from '@/lib/db/schema';
import { requireRole } from '@/lib/auth/middleware';
import { hashPassword } from '@/lib/auth/password';

const safeUserColumns = {
  id: users.id,
  username: users.username,
  displayName: users.displayName,
  email: users.email,
  role: users.role,
  active: users.active,
  kundeId: users.kundeId,
  createdAt: users.createdAt,
};

const updateSchema = z.object({
  displayName: z.string().min(1).max(255).optional(),
  email: z.string().email().max(255).optional().or(z.literal('')),
  role: z.enum(['admin', 'user']).optional(),
  active: z.boolean().optional(),
  newPassword: z
    .string()
    .min(12, 'Kennwort muss mindestens 12 Zeichen lang sein.')
    .max(255)
    .optional(),
  // null = zentraler Zugriff auf alle Mandanten
  kundeId: z.number({ coerce: true }).int().positive().nullable().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(request, 'admin');
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    // Eigener Account darf nicht deaktiviert oder herabgestuft werden
    if (userId === session.userId) {
      if (data.active === false) {
        return NextResponse.json(
          { error: 'Der eigene Account kann nicht deaktiviert werden.' },
          { status: 400 },
        );
      }
      if (data.role === 'user') {
        return NextResponse.json(
          { error: 'Die eigene Rolle kann nicht herabgestuft werden.' },
          { status: 400 },
        );
      }
    }

    if (typeof data.kundeId === 'number') {
      const [kunde] = await db
        .select({ id: kunden.id })
        .from(kunden)
        .where(eq(kunden.id, data.kundeId))
        .limit(1);
      if (!kunde) {
        return NextResponse.json(
          { error: 'Der angegebene Kunde existiert nicht' },
          { status: 400 },
        );
      }
    }

    const updates: Partial<typeof users.$inferInsert> = {};
    if (data.displayName !== undefined) updates.displayName = data.displayName;
    if (data.email !== undefined) updates.email = data.email || null;
    if (data.role !== undefined) updates.role = data.role;
    if (data.active !== undefined) updates.active = data.active;
    if (data.kundeId !== undefined) updates.kundeId = data.kundeId;
    if (data.newPassword !== undefined) {
      updates.passwordHash = await hashPassword(data.newPassword);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Keine Änderungen übergeben' },
        { status: 400 },
      );
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning(safeUserColumns);

    if (!updated) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    // Rollenwechsel, (De-)Aktivierung und Mandantenwechsel protokollieren
    const geaendert: string[] = [];
    if (data.role !== undefined) geaendert.push(`Rolle: ${data.role}`);
    if (data.active !== undefined) {
      geaendert.push(data.active ? 'aktiviert' : 'deaktiviert');
    }
    if (data.kundeId !== undefined) {
      geaendert.push(`Kunde: ${data.kundeId ?? 'alle'}`);
    }
    if (geaendert.length > 0) {
      await db.insert(systemProtokoll).values({
        ereignis: 'Benutzer geändert',
        benutzer: session.username,
        details: `Benutzer '${updated.username}': ${geaendert.join(', ')}`,
      });
    }

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Eingabe', details: err.errors }, { status: 400 });
    }
    console.error('PUT /api/admin/users/[id] error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
