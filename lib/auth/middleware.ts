import { NextRequest } from 'next/server';
import { verifyToken, type JwtPayload } from './jwt';

const COOKIE_NAME = 'hinweis-session';

export async function getSession(
  request: NextRequest,
): Promise<JwtPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}

export async function requireAuth(request: NextRequest): Promise<JwtPayload> {
  const session = await getSession(request);
  if (!session) {
    throw new Error('Nicht authentifiziert');
  }
  return session;
}
