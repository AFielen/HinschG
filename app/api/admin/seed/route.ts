import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, kundengruppen } from '@/lib/db/schema';

export async function POST() {
  try {
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    if (count > 0) {
      return NextResponse.json(
        { error: 'Seed kann nur ausgeführt werden, wenn keine Benutzer vorhanden sind.' },
        { status: 400 },
      );
    }

    const passwordHash = await bcrypt.hash('admin123', 12);
    const [adminUser] = await db
      .insert(users)
      .values({
        username: 'admin',
        passwordHash,
        displayName: 'Administrator',
        email: 'admin@drk-aachen.de',
        role: 'admin',
        active: true,
      })
      .returning();

    const gruppenNames = [
      'Kreisverband',
      'Ortsverein',
      'Landesverband',
      'Unternehmen',
      'Behörde',
      'Gemeinnütziger Verein',
    ];

    const gruppen = await db
      .insert(kundengruppen)
      .values(gruppenNames.map((name) => ({ name })))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Seed erfolgreich ausgeführt',
      admin: { id: adminUser.id, username: adminUser.username },
      kundengruppen: gruppen.map((g) => g.name),
    }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/seed error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
