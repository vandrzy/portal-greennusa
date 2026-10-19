import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AppCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');

    const whereClause =
      categoryParam === 'pemerintahan' || categoryParam === 'swasta'
        ? { category: categoryParam as AppCategory }
        : {};

    const apps = await prisma.app.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Transformasi response agar tetap 100% sesuai dengan interface EcosystemApp di frontend
    // dan gambar disajikan melalui endpoint GET /api/icon
    const formattedApps = apps.map((app) => ({
      id: app.id, // UUID dari database
      title: app.title,
      name: app.title,
      description: app.description,
      url: app.url,
      category: app.category,
      iconPath: app.iconPath.startsWith('/api/icon')
        ? app.iconPath
        : `/api/icon?path=${encodeURIComponent(app.iconPath)}`,
      rawIconPath: app.iconPath,
      appImage: app.appImage ?? null,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedApps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching apps:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil data aplikasi dari database',
      },
      { status: 500 }
    );
  }
}
