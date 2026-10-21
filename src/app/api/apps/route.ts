import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { AppCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

const parseFeatures = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean).slice(0, 4);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean).slice(0, 4);
      }
    } catch {
      return [];
    }
  }
  return [];
};

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
      prisma.application.count({ where: whereClause }),
      prisma.application.findMany({
        where: whereClause,
        ...(isPaginated ? { skip, take: limit } : {}),
        orderBy: {
          createdAt: 'asc',
        },
      }),
    ]);

    // Transformasi response agar sesuai dengan interface EcosystemApp dan kontrak API baru
    const formattedApps = apps.map((app) => ({
      id: app.slug,
      dbId: app.id,
      title: app.title || app.name,
      name: app.name,
      appType: app.appType || '',
      tagline: app.tagline || '',
      features: parseFeatures(app.features),
      category: app.category === 'pemerintahan' ? 'pemerintahan' : 'swasta',
      description: app.description,
      icon: app.iconUrl,
      iconPath: app.iconUrl.startsWith('/api/icon')
        ? app.iconUrl
        : `/api/icon?path=${encodeURIComponent(app.iconUrl)}`,
      rawIconPath: app.iconUrl,
      url: app.url,
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
