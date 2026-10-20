import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/pengaturan
 * Mengambil profil dasar akun admin yang sedang login.
 * Hanya bisa diakses oleh akun admin yang sudah login.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSessionFromRequest(request);
    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.sub },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Akun admin tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: user,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('[API Admin Pengaturan] Error GET profile:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat memuat data akun' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/pengaturan
 * Mereset password akun admin yang sedang login.
 * Memerlukan: newPassword dan confirmPassword.
 * Hanya bisa diakses oleh akun admin yang sudah login.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSessionFromRequest(request);
    if (!session || !session.sub) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Request body tidak valid' },
        { status: 400 }
      );
    }

    const { newPassword, confirmPassword } = body as {
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!newPassword || typeof newPassword !== 'string' || !newPassword.trim()) {
      return NextResponse.json(
        { success: false, message: 'Password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (!confirmPassword || typeof confirmPassword !== 'string' || !confirmPassword.trim()) {
      return NextResponse.json(
        { success: false, message: 'Konfirmasi password baru wajib diisi' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password baru minimal harus 6 karakter' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Konfirmasi password tidak cocok dengan password baru' },
        { status: 400 }
      );
    }

    // Pastikan user masih ada di database
    const user = await prisma.user.findUnique({
      where: { id: session.sub },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Akun admin tidak ditemukan di database' },
        { status: 404 }
      );
    }

    // Enkripsi password baru menggunakan bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password di database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Password admin berhasil diperbarui',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('[API Admin Pengaturan] Error POST reset password:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat memperbarui password' },
      { status: 500 }
    );
  }
}
