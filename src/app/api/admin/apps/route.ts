import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import {
  saveIconFile,
  deleteOldIconFile,
  saveAppImageFile,
  deleteAppImageFile,
  validateAppImageFile,
  INVALID_IMAGE_ERROR_MESSAGE,
} from '@/lib/iconStorage';
import { AppCategory, Prisma } from '@prisma/client';

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
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const whereClause: Prisma.AppWhereInput = {};

    if (categoryParam === 'pemerintahan' || categoryParam === 'swasta') {
      whereClause.category = categoryParam as AppCategory;
    }

    if (searchParam && searchParam.trim()) {
      const query = searchParam.trim();
      whereClause.OR = [
        { title: { contains: query } },
        { description: { contains: query } },
        { url: { contains: query } },
      ];
    }

    // Server-side pagination
    const isPaginated = pageParam !== null || limitParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = isPaginated ? Math.max(1, parseInt(limitParam || '6', 10) || 6) : undefined;
    const skip = isPaginated && limit ? (page - 1) * limit : undefined;

    const [total, apps] = await prisma.$transaction([
      prisma.app.count({ where: whereClause }),
      prisma.app.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc',
        },
        ...(skip !== undefined ? { skip } : {}),
        ...(limit !== undefined ? { take: limit } : {}),
      }),
    ]);

    const effectiveLimit = limit || total || 1;
    const totalPages = Math.max(1, Math.ceil(total / effectiveLimit));

    const formattedApps = apps.map((app) => ({
      id: app.id,
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
      rawAppImage: app.appImage ?? null,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        data: formattedApps,
        pagination: {
          page,
          limit: limit || total,
          total,
          totalPages,
        },
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
  let savedAppImagePath: string | null = null;

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
    let appImageFile: File | string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = (formData.get('title') || formData.get('name') || '') as string;
      description = (formData.get('description') || '') as string;
      url = (formData.get('url') || '') as string;
      category = (formData.get('category') || 'pemerintahan') as string;
      iconFile = formData.get('icon') as File | string | null;
      appImageFile = (formData.get('appImageFile') || formData.get('appImage')) as File | string | null;
    } else {
      const body = await request.json().catch(() => ({}));
      title = body.title || body.name || '';
      description = body.description || '';
      url = body.url || '';
      category = body.category || 'pemerintahan';
      iconFile = body.icon || null;
      appImageFile = body.appImageFile || body.appImage || null;
    }

    // Validasi field teks
    if (!title.trim() || !description.trim() || !url.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi, deskripsi, dan URL wajib diisi' },
        { status: 400 }
      );
    }

    if (title.trim().length > 30) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi maksimal 30 karakter' },
        { status: 400 }
      );
    }

    if (description.trim().length > 200) {
      return NextResponse.json(
        { success: false, message: 'Deskripsi aplikasi maksimal 200 karakter' },
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

    // 3. Simpan dan validasi file icon gambar (Wajib)
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

    // 4. Simpan dan validasi file gambar aplikasi (Opsional)
    if (appImageFile) {
      if (typeof appImageFile === 'object' && 'size' in appImageFile && appImageFile.size > 0) {
        const imgError = validateAppImageFile(appImageFile as File);
        if (imgError) {
          if (savedIconPath) await deleteOldIconFile(savedIconPath);
          return NextResponse.json({ success: false, message: imgError }, { status: 400 });
        }
        try {
          savedAppImagePath = await saveAppImageFile(appImageFile, prismaCategory);
        } catch (imgSaveErr: unknown) {
          const err = imgSaveErr as Error;
          if (savedIconPath) await deleteOldIconFile(savedIconPath);
          return NextResponse.json(
            { success: false, message: err.message || 'Gagal menyimpan gambar aplikasi' },
            { status: 400 }
          );
        }
      } else if (typeof appImageFile === 'string' && appImageFile.startsWith('data:')) {
        try {
          savedAppImagePath = await saveAppImageFile(appImageFile, prismaCategory);
        } catch (imgSaveErr: unknown) {
          const err = imgSaveErr as Error;
          if (savedIconPath) await deleteOldIconFile(savedIconPath);
          return NextResponse.json(
            { success: false, message: err.message || 'Gagal menyimpan gambar aplikasi' },
            { status: 400 }
          );
        }
      }
    }

    // 5. Jalankan pembuatan record database secara transaksional
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
            appImage: savedAppImagePath,
          },
        });
      });
    } catch (txError) {
      console.error('Transaksi database gagal saat create aplikasi:', txError);
      // ROLLBACK: Hapus file fisik yang sempat tersimpan di disk agar tidak menjadi file sampah
      if (savedIconPath) {
        await deleteOldIconFile(savedIconPath);
      }
      if (savedAppImagePath) {
        await deleteAppImageFile(savedAppImagePath);
      }
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan aplikasi ke database. Operasi dibatalkan.' },
        { status: 500 }
      );
    }

    const formattedCreated = {
      id: createdApp.id,
      title: createdApp.title,
      name: createdApp.title,
      description: createdApp.description,
      url: createdApp.url,
      category: createdApp.category,
      iconPath: `/api/icon?path=${encodeURIComponent(createdApp.iconPath)}`,
      rawIconPath: createdApp.iconPath,
      appImage: createdApp.appImage ?? null,
      rawAppImage: createdApp.appImage ?? null,
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
    if (savedAppImagePath) {
      await deleteAppImageFile(savedAppImagePath);
    }
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat menambahkan aplikasi' },
      { status: 500 }
    );
  }
}
