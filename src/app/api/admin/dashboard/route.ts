import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import { PEMERINTAHAN_APPS, SWASTA_APPS } from '@/data/ecosystemApps';

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

    let pemerintahanCount = 0;
    let swastaCount = 0;
    let totalCount = 0;

    try {
      // 2. Ambil data agregat secara transaksional menggunakan prisma.$transaction
      const [pemCount, swaCount, totCount] = await prisma.$transaction([
        prisma.app.count({ where: { category: 'pemerintahan' } }),
        prisma.app.count({ where: { category: 'swasta' } }),
        prisma.app.count(),
      ]);

      pemerintahanCount = pemCount;
      swastaCount = swaCount;
      totalCount = totCount;
    } catch (dbError) {
      console.warn('Database query failed for dashboard, using static dataset fallback:', dbError);
      // Fallback jika database lokal belum running
      pemerintahanCount = PEMERINTAHAN_APPS.length;
      swastaCount = SWASTA_APPS.length;
      totalCount = PEMERINTAHAN_APPS.length + SWASTA_APPS.length;
    }

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
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/dashboard:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
