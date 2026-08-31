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

const CSP =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: blob:; " +
  "font-src 'self'; " +
  "connect-src 'self'; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self'; " +
  "frame-ancestors 'none'";

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()',
  );
  // CSP und HSTS nur in Produktion (next dev benötigt 'unsafe-eval',
  // HSTS auf localhost ohne TLS wäre kontraproduktiv)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Content-Security-Policy', CSP);
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains',
    );
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = withSecurityHeaders(NextResponse.next());

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

  // /api/admin/seed schützt sich selbst per Setup-Token
  if (pathname === '/api/admin/seed') {
    return response;
  }

  // Protected API routes (/api/admin/*) → 401 JSON statt Redirect
  if (pathname.startsWith('/api/admin')) {
    const session = await getSession(request);
    if (!session) {
      return withSecurityHeaders(
        NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 }),
      );
    }
    return response;
  }

  // Protected routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    const session = await getSession(request);
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.svg).*)'],
};
