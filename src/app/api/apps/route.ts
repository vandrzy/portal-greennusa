import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AppCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const whereClause =
      categoryParam === 'pemerintahan' || categoryParam === 'swasta'
        ? { category: categoryParam as AppCategory }
        : {};

    const isPaginated = pageParam !== null || limitParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.max(1, parseInt(limitParam || '9', 10) || 9);
    const skip = (page - 1) * limit;

    const [total, apps] = await Promise.all([
      prisma.app.count({ where: whereClause }),
      prisma.app.findMany({
        where: whereClause,
        ...(isPaginated ? { skip, take: limit } : {}),
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

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

    const totalPages = isPaginated ? Math.ceil(total / limit) : 1;
    const hasMore = isPaginated ? skip + apps.length < total : false;

    return NextResponse.json(
      {
        success: true,
        data: formattedApps,
        pagination: {
          page: isPaginated ? page : 1,
          limit: isPaginated ? limit : total,
          total,
          totalPages,
          hasMore,
        },
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
