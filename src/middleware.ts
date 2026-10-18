import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const AUTH_COOKIE_NAME = 'auth_token';
const JWT_SECRET = process.env.JWT_SECRET || 'greennusa-secret-key';
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

  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';

  // 1. If accessing /admin or /admin/* without valid token -> redirect to /login
  if (isAdminRoute && !isValid) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If accessing /login with valid token -> redirect to /admin/dashboard
  if (isLoginRoute && isValid) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // 3. If accessing root /admin with valid token -> redirect to /admin/dashboard
  if ((pathname === '/admin' || pathname === '/admin/') && isValid) {
    const dashboardUrl = new URL('/admin/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin', '/login'],
};
