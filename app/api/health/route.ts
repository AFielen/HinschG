import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/version';

/**
 * Health-Check für Monitoring/Load-Balancer — ohne Auth, ohne DB-Abfrage.
 */
export function GET() {
  return NextResponse.json({
    status: 'ok',
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
  });
}
