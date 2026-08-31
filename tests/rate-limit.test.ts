import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { rateLimit } from '@/lib/rate-limit';

// Der Limiter hält seinen Zustand in einer Modul-Map — daher pro Test
// eindeutige Keys verwenden, damit Tests sich nicht beeinflussen.
let n = 0;
function frischerKey(): string {
  return `test-key-${++n}`;
}

describe('lib/rate-limit', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('erlaubt Anfragen bis zum Limit, danach ok=false mit retryAfterSeconds > 0', () => {
    const key = frischerKey();
    const opts = { limit: 3, windowMs: 60_000 };

    for (let i = 0; i < 3; i++) {
      const r = rateLimit(key, opts);
      expect(r.ok).toBe(true);
      expect(r.retryAfterSeconds).toBe(0);
    }

    const abgelehnt = rateLimit(key, opts);
    expect(abgelehnt.ok).toBe(false);
    expect(abgelehnt.retryAfterSeconds).toBeGreaterThan(0);
    expect(abgelehnt.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it('nach Ablauf des Fensters ist der Key wieder frei', () => {
    const key = frischerKey();
    const opts = { limit: 2, windowMs: 10_000 };

    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(false);

    // Fenster ablaufen lassen
    vi.advanceTimersByTime(10_001);

    const danach = rateLimit(key, opts);
    expect(danach.ok).toBe(true);
    expect(danach.retryAfterSeconds).toBe(0);
  });

  it('getrennte Keys werden unabhängig gezählt', () => {
    const keyA = frischerKey();
    const keyB = frischerKey();
    const opts = { limit: 1, windowMs: 60_000 };

    expect(rateLimit(keyA, opts).ok).toBe(true);
    expect(rateLimit(keyA, opts).ok).toBe(false);

    // keyB ist davon unberührt
    expect(rateLimit(keyB, opts).ok).toBe(true);
    expect(rateLimit(keyB, opts).ok).toBe(false);
  });
});
