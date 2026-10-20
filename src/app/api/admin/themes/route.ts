import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { validateThemeImage, saveThemeImage } from '@/lib/themeStorage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '5', 10));
    const search = (searchParams.get('search') || '').trim();

    const whereClause = search
      ? { name: { contains: search } }
      : {};

    const [total, themes] = await Promise.all([
      prisma.theme.count({ where: whereClause }),
      prisma.theme.findMany({
        where: whereClause,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      themes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error('Error GET /api/admin/themes:', error);
    return NextResponse.json({ error: 'Gagal memuat data tema' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const name = (formData.get('name') as string | null)?.trim();
    const modalOverlayColor = (formData.get('modalOverlayColor') as string | null)?.trim();
    const isActive = formData.get('isActive') === 'true';
    const bgFile = formData.get('bgFile') as File | null;

    if (!name || !modalOverlayColor) {
      return NextResponse.json(
        { error: 'Nama tema dan warna overlay wajib diisi' },
        { status: 400 }
      );
    }

    if (name.length > 20) {
      return NextResponse.json(
        { error: 'Nama tema maksimal 20 karakter' },
        { status: 400 }
      );
    }

    if (!bgFile || bgFile.size === 0) {
      return NextResponse.json(
        { error: 'Gambar background wajib diunggah' },
        { status: 400 }
      );
    }

    const validationError = validateThemeImage(bgFile);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const bgImagePath = await saveThemeImage(bgFile);

    const createdTheme = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.theme.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      return tx.theme.create({
        data: {
          name,
          bgImage: bgImagePath,
          modalOverlayColor,
          isActive,
          isDefault: false,
        },
      });
    });

    return NextResponse.json({ theme: createdTheme }, { status: 201 });
  } catch (error) {
    console.error('Error POST /api/admin/themes:', error);
    return NextResponse.json({ error: 'Gagal membuat tema baru' }, { status: 500 });
  }
}
