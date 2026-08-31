import { SignJWT, jwtVerify } from 'jose';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  kundeId: number | null;
}

/** Gültige Benutzerrollen (deckt sich mit userRoleEnum im Schema). */
export const VALID_ROLES = ['admin', 'user'] as const;

/**
 * Scope-Claim, der ein Admin-/Bearbeiter-Session-Token vom Postfach-Token
 * unterscheidet. Beide werden mit demselben JWT_SECRET signiert, dürfen aber
 * NICHT gegeneinander austauschbar sein (sonst Rechteausweitung).
 */
const SESSION_SCOPE = 'session';

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
  return new SignJWT({ ...rest, kundeId, scope: SESSION_SCOPE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());

  // Token-Verwechslung verhindern: nur echte Session-Tokens akzeptieren.
  // Ein Postfach-Token (scope 'postfach') darf hier NICHT als Session gelten.
  if (payload.scope !== SESSION_SCOPE) {
    throw new Error('Kein gültiges Session-Token');
  }
  if (typeof payload.userId !== 'number') {
    throw new Error('Ungültige Session (userId)');
  }
  if (
    typeof payload.role !== 'string' ||
    !(VALID_ROLES as readonly string[]).includes(payload.role)
  ) {
    throw new Error('Ungültige Session (role)');
  }

  return {
    userId: payload.userId,
    username: payload.username as string,
    role: payload.role,
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
