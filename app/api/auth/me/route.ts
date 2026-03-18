import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/auth/middleware';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user) {
    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
  }

  return NextResponse.json({ user });
}
