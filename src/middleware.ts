import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const AUTH_COOKIE_NAME = 'auth_token';
const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_SECRET || 'greennusa-secret-key';
const secretKey = new TextEncoder().encode(JWT_SECRET);

async function isTokenValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return Boolean(payload && payload.sub);
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isValid = await isTokenValid(token);

  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isKontenPortalApiRoute = pathname.startsWith('/api/kontenportal');
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  // 1. If accessing /api/admin/* without valid token -> return 401 JSON
  if (isAdminApiRoute && !isValid) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
      { status: 401 }
    );
  }

  // 1b. If mutating /api/kontenportal without valid token -> return 401 JSON
  if (isKontenPortalApiRoute && request.method !== 'GET' && !isValid) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
      { status: 401 }
    );
  }

  // 2. If accessing /admin or /admin/* without valid token -> redirect to /login
  if (isAdminRoute && !isValid) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 3. If accessing /login with valid token -> redirect to /admin/dashboard
  if (isLoginRoute && isValid) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 4. If accessing root /admin with valid token -> redirect to /admin/dashboard
  if ((pathname === '/admin' || pathname === '/admin/') && isValid) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/login', '/api/admin/:path*', '/api/kontenportal', '/api/kontenportal/:path*'],
};
