import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, kunden, systemProtokoll } from '@/lib/db/schema';
import { requireAuth, requireRole } from '@/lib/auth/middleware';
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

export async function GET(request: NextRequest) {
  try {
    const zweck = new URL(request.url).searchParams.get('zweck');

    // Benutzer-Auswahl für Aufgaben-Zuweisung: für jeden eingeloggten
    // Benutzer erlaubt, liefert nur aktive Benutzer mit Minimal-Feldern.
    if (zweck === 'zuweisung') {
      await requireAuth(request);

      const rows = await db
        .select({
          id: users.id,
          displayName: users.displayName,
          username: users.username,
        })
        .from(users)
        .where(eq(users.active, true))
        .orderBy(users.displayName);

      return NextResponse.json({ data: rows });
    }

    await requireRole(request, 'admin');

    const rows = await db
      .select(safeUserColumns)
      .from(users)
      .orderBy(users.id);

    return NextResponse.json({ data: rows });
  } catch (err) {
    if (err instanceof Error && err.message === 'Nicht authentifiziert') {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    if (err instanceof Error && err.message === 'Keine Berechtigung') {
      return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 });
    }
    console.error('GET /api/admin/users error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

const createSchema = z.object({
  username: z
    .string()
    .min(3, 'Benutzername muss mindestens 3 Zeichen lang sein.')
    .max(255),
  displayName: z.string().min(1, 'Anzeigename ist erforderlich.').max(255),
  email: z.string().email().max(255).optional().or(z.literal('')),
  role: z.enum(['admin', 'user']),
  password: z
    .string()
    .min(12, 'Kennwort muss mindestens 12 Zeichen lang sein.')
    .max(255),
  // null = zentraler Zugriff auf alle Mandanten
  kundeId: z.number({ coerce: true }).int().positive().nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, 'admin');
    const body = await request.json();
    const data = createSchema.parse(body);

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, data.username))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: 'Benutzername ist bereits vergeben' },
        { status: 409 },
      );
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

    const passwordHash = await hashPassword(data.password);

    const [created] = await db
      .insert(users)
      .values({
        username: data.username,
        passwordHash,
        displayName: data.displayName,
        email: data.email || null,
        role: data.role,
        active: true,
        kundeId: data.kundeId ?? null,
      })
      .returning(safeUserColumns);

    await db.insert(systemProtokoll).values({
      ereignis: 'Benutzer angelegt',
      benutzer: session.username,
      details: `Benutzer '${created.username}' angelegt (Rolle: ${created.role}, Kunde: ${created.kundeId ?? 'alle'})`,
    });

    return NextResponse.json({ user: created }, { status: 201 });
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
    // Unique-Verletzung (Race zwischen Prüfung und Insert)
    if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
      return NextResponse.json(
        { error: 'Benutzername ist bereits vergeben' },
        { status: 409 },
      );
    }
    console.error('POST /api/admin/users error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
