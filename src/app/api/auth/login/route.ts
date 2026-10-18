import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Request body tidak valid' },
        { status: 400 }
      );
    }

    const { identifier, password } = body as { identifier?: string; password?: string };

    if (!identifier || !identifier.trim() || !password || !password.trim()) {
      return NextResponse.json(
        { success: false, message: 'Username/email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim();
    let user = null;

    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: cleanIdentifier },
            { email: cleanIdentifier },
          ],
        },
      });
    } catch (dbError) {
      console.warn('Database query failed, checking fallback credentials:', dbError);
      // Fallback untuk admin default seed jika koneksi database lokal belum aktif
      if (
        (cleanIdentifier === 'admin' || cleanIdentifier === 'admin@greennusa.id') &&
        password === 'AdminGreenNusa123!'
      ) {
        user = {
          id: 'seed-admin-uuid',
          name: 'Administrator GreenNusa',
          username: 'admin',
          email: 'admin@greennusa.id',
          password: await bcrypt.hash('AdminGreenNusa123!', 10),
          role: 'admin',
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username/email atau password salah' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Username/email atau password salah' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = await signAuthToken({
      sub: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login berhasil',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Set cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
