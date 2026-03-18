import { NextResponse, type NextRequest } from 'next/server';
import { getSession } from '@/lib/auth/middleware';

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/impressum',
  '/datenschutz',
  '/hilfe',
  '/spenden',
];

const PUBLIC_PREFIXES = [
  '/meldestelle',
  '/api/auth',
  '/api/public',
  '/_next',
  '/favicon',
];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );

  // Static assets and public routes don't need auth
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return response;
  }

  if (isPublicRoute(pathname)) {
    return response;
  }

  // Protected routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    const session = await getSession(request);
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.svg).*)'],
};
