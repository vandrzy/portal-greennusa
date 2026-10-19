import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import { saveIconFile, deleteOldIconFile, INVALID_IMAGE_ERROR_MESSAGE } from '@/lib/iconStorage';
import { AppCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Verifikasi autentikasi
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');

    const whereClause: {
      category?: AppCategory;
      OR?: Array<{
        title?: { contains: string };
        description?: { contains: string };
      }>;
    } = {};

    if (categoryParam === 'pemerintahan' || categoryParam === 'swasta') {
      whereClause.category = categoryParam as AppCategory;
    }

    if (searchParam && searchParam.trim()) {
      const query = searchParam.trim();
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
      ];
    }

    const apps = await prisma.app.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedApps = apps.map((app) => ({
      id: app.id,
      title: app.title,
      description: app.description,
      url: app.url,
      category: app.category,
      iconPath: app.iconPath.startsWith('/api/icon')
        ? app.iconPath
        : `/api/icon?path=${encodeURIComponent(app.iconPath)}`,
      rawIconPath: app.iconPath,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedApps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/apps:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat memuat data aplikasi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let savedIconPath: string | null = null;

  try {
    // 1. Verifikasi autentikasi
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    // 2. Baca input dari FormData atau JSON
    const contentType = request.headers.get('content-type') || '';
    let title = '';
    let description = '';
    let url = '';
    let category = 'pemerintahan';
    let iconFile: File | string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') || formData.get('name') || '') as string;
      description = (formData.get('description') || '') as string;
      url = (formData.get('url') || '') as string;
      category = (formData.get('category') || 'pemerintahan') as string;
      iconFile = formData.get('icon') as File | string | null;
    } else {
      const body = await request.json().catch(() => ({}));
      title = body.title || body.name || '';
      description = body.description || '';
      url = body.url || '';
      category = body.category || 'pemerintahan';
      iconFile = body.icon || null;
    }

    // Validasi field teks
    if (!title.trim() || !description.trim() || !url.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi, deskripsi, dan URL wajib diisi' },
        { status: 400 }
      );
    }

    const normCategory = category.toLowerCase().trim();
    if (normCategory !== 'pemerintahan' && normCategory !== 'pemerintah' && normCategory !== 'swasta') {
      return NextResponse.json(
        { success: false, message: 'Kategori harus bernilai Pemerintahan atau Swasta' },
        { status: 400 }
      );
    }
    const prismaCategory = (normCategory === 'pemerintah' ? 'pemerintahan' : normCategory) as AppCategory;

    if (!iconFile) {
      return NextResponse.json(
        { success: false, message: 'File icon aplikasi wajib diunggah' },
        { status: 400 }
      );
    }

    // 3. Simpan dan validasi file icon gambar
    try {
      const savedIcon = await saveIconFile(iconFile, prismaCategory);
      savedIconPath = savedIcon.relativePath;
    } catch (valErr: unknown) {
      const err = valErr as Error;
      return NextResponse.json(
        { success: false, message: err.message || INVALID_IMAGE_ERROR_MESSAGE },
        { status: 400 }
      );
    }

    // 4. Jalankan pembuatan record database secara transaksional
    let createdApp;
    try {
      createdApp = await prisma.$transaction(async (tx) => {
        return tx.app.create({
          data: {
            title: title.trim(),
            description: description.trim(),
            url: url.trim(),
            category: prismaCategory,
            iconPath: savedIconPath!,
          },
        });
      });
    } catch (txError) {
      console.error('Transaksi database gagal saat create aplikasi:', txError);
      // ROLLBACK: Hapus file icon yang sempat tersimpan di disk agar tidak menjadi file sampah
      if (savedIconPath) {
        await deleteOldIconFile(savedIconPath);
      }
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan aplikasi ke database. Operasi dibatalkan.' },
        { status: 500 }
      );
    }

    const formattedCreated = {
      id: createdApp.id,
      title: createdApp.title,
      description: createdApp.description,
      url: createdApp.url,
      category: createdApp.category,
      iconPath: `/api/icon?path=${encodeURIComponent(createdApp.iconPath)}`,
      rawIconPath: createdApp.iconPath,
      createdAt: createdApp.createdAt,
      updatedAt: createdApp.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Aplikasi berhasil ditambahkan',
        data: formattedCreated,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/admin/apps:', error);
    // Cleanup jika terjadi error tak terduga
    if (savedIconPath) {
      await deleteOldIconFile(savedIconPath);
    }
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat menambahkan aplikasi' },
      { status: 500 }
    );
  }
}
