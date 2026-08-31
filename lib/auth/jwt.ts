import { SignJWT, jwtVerify } from 'jose';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  kundeId: number | null;
}

/** Cookie-Name für die Postfach-Session des Hinweisgebers. */
export const POSTFACH_COOKIE_NAME = 'postfach-session';

/** Cookie-Optionen für die Postfach-Session (2h Gültigkeit). */
export const POSTFACH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7200,
  path: '/',
};

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET Umgebungsvariable ist nicht gesetzt');
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(
  payload: Omit<JwtPayload, 'kundeId'> & { kundeId?: number | null },
): Promise<string> {
  const { kundeId = null, ...rest } = payload;
  return new SignJWT({ ...rest, kundeId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    userId: payload.userId as number,
    username: payload.username as string,
    role: payload.role as string,
    kundeId: typeof payload.kundeId === 'number' ? payload.kundeId : null,
  };
}

/**
 * Erstellt ein Postfach-Token für den Hinweisgeber (2h gültig,
 * Claim scope:'postfach').
 */
export async function createPostfachToken(hinweisId: number): Promise<string> {
  return new SignJWT({ hinweisId, scope: 'postfach' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(getSecret());
}

/**
 * Prüft ein Postfach-Token. Nur gültig, wenn scope==='postfach'.
 */
export async function verifyPostfachToken(
  token: string,
): Promise<{ hinweisId: number } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.scope !== 'postfach') return null;
    if (typeof payload.hinweisId !== 'number') return null;
    return { hinweisId: payload.hinweisId };
  } catch {
    return null;
  }
}
