import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi autentikasi admin
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    // 2. Ambil data agregat secara paralel menggunakan Promise.all untuk kecepatan respons optimal
    const [pemerintahanCount, swastaCount, totalCount] = await Promise.all([
      prisma.application.count({ where: { category: 'pemerintahan' } }),
      prisma.application.count({ where: { category: 'swasta' } }),
      prisma.application.count(),
    ]);

    // 3. Kembalikan response JSON
    return NextResponse.json(
      {
        success: true,
        data: {
          pemerintahan: pemerintahanCount,
          swasta: swastaCount,
          total: totalCount,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
