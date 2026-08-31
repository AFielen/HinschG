import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, kundengruppen, systemProtokoll } from '@/lib/db/schema';
import { hashPassword } from '@/lib/auth/password';

export async function POST(request: NextRequest) {
  try {
    const setupToken = process.env.SETUP_TOKEN;
    if (!setupToken) {
      return NextResponse.json(
        {
          error:
            'Seed ist nicht konfiguriert. Bitte die Umgebungsvariable SETUP_TOKEN setzen.',
        },
        { status: 503 },
      );
    }

    if (request.headers.get('x-setup-token') !== setupToken) {
      return NextResponse.json(
        { error: 'Ungültiger oder fehlender Setup-Token' },
        { status: 401 },
      );
    }

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    if (count > 0) {
      return NextResponse.json(
        { error: 'Seed kann nur ausgeführt werden, wenn keine Benutzer vorhanden sind.' },
        { status: 400 },
      );
    }

    // Zufälliges Initialpasswort — wird EINMALIG im Response zurückgegeben
    const initialPassword = crypto.randomBytes(12).toString('base64url');
    const passwordHash = await hashPassword(initialPassword);

    const [adminUser] = await db
      .insert(users)
      .values({
        username: 'admin',
        passwordHash,
        displayName: 'Administrator',
        email: 'admin@drk-aachen.de',
        role: 'admin',
        active: true,
        // null = zentraler Zugriff auf alle Mandanten
        kundeId: null,
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

    await db.insert(systemProtokoll).values({
      ereignis: 'Seed ausgeführt',
      benutzer: adminUser.username,
      details: 'Admin-Benutzer und Kundengruppen angelegt',
    });

    return NextResponse.json({
      success: true,
      message:
        'Seed erfolgreich ausgeführt. Das Admin-Passwort wird nur dieses eine Mal angezeigt — bitte sicher verwahren.',
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        initialPassword,
      },
      kundengruppen: gruppen.map((g) => g.name),
    }, { status: 201 });
  } catch (err) {
    console.error('POST /api/admin/seed error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
