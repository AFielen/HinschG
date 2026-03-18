import { SignJWT, jwtVerify } from 'jose';

export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET Umgebungsvariable ist nicht gesetzt');
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload })
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
  };
}
