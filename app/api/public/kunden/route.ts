import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { kunden } from '@/lib/db/schema';

export async function GET() {
  try {
    const rows = await db
      .select({ id: kunden.id, firma: kunden.firma })
      .from(kunden);

    return NextResponse.json(rows);
  } catch (err) {
    console.error('GET /api/public/kunden error:', err);
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}
