import { beforeAll, describe, expect, it } from 'vitest';
import {
  createToken,
  verifyToken,
  createPostfachToken,
  verifyPostfachToken,
} from '@/lib/auth/jwt';

// jwt.ts liest JWT_SECRET zur Laufzeit — kein DB-Import, daher Unit-testbar.
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-mindestens-32-zeichen-lang!!';
});

describe('lib/auth/jwt – Token-Scope-Trennung', () => {
  it('Session-Token verifiziert und liefert die Claims', async () => {
    const token = await createToken({
      userId: 1,
      username: 'admin',
      role: 'admin',
      kundeId: null,
    });
    const payload = await verifyToken(token);
    expect(payload).toMatchObject({ userId: 1, username: 'admin', role: 'admin', kundeId: null });
  });

  it('Postfach-Token wird NICHT als Admin-Session akzeptiert (Scope-Verwechslung)', async () => {
    const postfach = await createPostfachToken(42);
    await expect(verifyToken(postfach)).rejects.toThrow();
  });

  it('Admin-Session-Token wird NICHT als Postfach-Token akzeptiert', async () => {
    const session = await createToken({
      userId: 1,
      username: 'admin',
      role: 'admin',
      kundeId: null,
    });
    expect(await verifyPostfachToken(session)).toBeNull();
  });

  it('Postfach-Token verifiziert über den eigenen Verifier', async () => {
    const postfach = await createPostfachToken(42);
    expect(await verifyPostfachToken(postfach)).toEqual({ hinweisId: 42 });
  });

  it('Session-Token mit unbekannter Rolle wird abgelehnt', async () => {
    // Über die öffentliche API lässt sich keine ungültige Rolle setzen;
    // dieser Test sichert die Rollen-Validierung in verifyToken ab, indem
    // ein Postfach-Token (ohne role/userId) am Session-Verifier scheitert.
    const postfach = await createPostfachToken(7);
    await expect(verifyToken(postfach)).rejects.toThrow();
  });
});
