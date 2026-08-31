import { NextResponse } from 'next/server';
import {
  POSTFACH_COOKIE_NAME,
  POSTFACH_COOKIE_OPTIONS,
} from '@/lib/auth/jwt';

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(POSTFACH_COOKIE_NAME, '', {
    ...POSTFACH_COOKIE_OPTIONS,
    maxAge: 0,
  });

  return response;
}
