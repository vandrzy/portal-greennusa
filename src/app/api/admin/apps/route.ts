import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import {
  saveIconFile,
  deleteOldIconFile,
  INVALID_IMAGE_ERROR_MESSAGE,
} from '@/lib/iconStorage';
import { AppCategory, Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

const parseFeatures = (raw: unknown): string[] => {
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      if (raw.trim()) {
        return [raw.trim()];
      }
      return [];
    }
  }
  return [];
};

const generateSlug = async (name: string): Promise<string> => {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'app';

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.application.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
};

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

    const whereClause: Prisma.ApplicationWhereInput = {};

    if (categoryParam === 'pemerintahan' || categoryParam === 'swasta') {
      whereClause.category = categoryParam as AppCategory;
    }

    if (searchParam && searchParam.trim()) {
      const query = searchParam.trim();
      whereClause.OR = [
        { title: { contains: query } },
        { name: { contains: query } },
        { appType: { contains: query } },
        { tagline: { contains: query } },
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
      prisma.application.count({ where: whereClause }),
      prisma.application.findMany({
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
      id: String(app.id),
      dbId: app.id,
      slug: app.slug,
      title: app.title || app.name,
      name: app.name,
      appType: app.appType || '',
      tagline: app.tagline || '',
      features: parseFeatures(app.features).slice(0, 4),
      description: app.description,
      url: app.url,
      category: app.category,
      icon: app.iconUrl,
      iconPath: app.iconUrl.startsWith('/api/icon')
        ? app.iconUrl
        : `/api/icon?path=${encodeURIComponent(app.iconUrl)}`,
      rawIconPath: app.iconUrl,
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
    let name = '';
    let appType = '';
    let tagline = '';
    let description = '';
    let url = '';
    let category = 'pemerintahan';
    let featuresRaw: unknown = [];
    let iconFile: File | string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      title = String(formData.get('title') ?? '').trim();
      name = String(formData.get('name') ?? '').trim();
      appType = String(formData.get('appType') ?? '').trim();
      tagline = String(formData.get('tagline') ?? '').trim();
      description = String(formData.get('description') ?? '').trim();
      url = String(formData.get('url') ?? '').trim();
      category = String(formData.get('category') ?? 'pemerintahan').trim();
      featuresRaw = formData.get('features');
      iconFile = formData.get('icon') as File | string | null;
    } else {
      const body = await request.json().catch(() => ({}));
      title = String(body.title ?? '').trim();
      name = String(body.name ?? '').trim();
      appType = String(body.appType ?? '').trim();
      tagline = String(body.tagline ?? '').trim();
      description = String(body.description ?? '').trim();
      url = String(body.url ?? '').trim();
      category = String(body.category ?? 'pemerintahan').trim();
      featuresRaw = body.features;
      iconFile = body.icon || null;
    }

    // Fallback name <-> title jika salah satu kosong
    if (!name && title) name = title;
    if (!title && name) title = name;

    // Validasi field teks wajib
    if (!title || !name || !appType || !tagline || !description || !url) {
      return NextResponse.json(
        { success: false, message: 'Judul, nama, jenis aplikasi, tagline, deskripsi, dan URL wajib diisi' },
        { status: 400 }
      );
    }

    if (title.length > 60) {
      return NextResponse.json(
        { success: false, message: 'Judul aplikasi maksimal 60 karakter' },
        { status: 400 }
      );
    }

    if (name.length > 25) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi maksimal 25 karakter' },
        { status: 400 }
      );
    }

    if (appType.length > 25) {
      return NextResponse.json(
        { success: false, message: 'Jenis aplikasi maksimal 25 karakter' },
        { status: 400 }
      );
    }

    if (tagline.length > 70) {
      return NextResponse.json(
        { success: false, message: 'Tagline aplikasi maksimal 70 karakter' },
        { status: 400 }
      );
    }

    if (description.length > 200) {
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

    // Validasi Keunggulan (Maksimal 4 item, maks. 60 karakter/item)
    const cleanedFeatures = parseFeatures(featuresRaw);
    if (cleanedFeatures.length > 4) {
      return NextResponse.json(
        { success: false, message: 'Keunggulan aplikasi maksimal 4 poin.' },
        { status: 400 }
      );
    }
    if (cleanedFeatures.some((item) => item.length > 60)) {
      return NextResponse.json(
        { success: false, message: 'Tiap item keunggulan aplikasi maksimal 60 karakter' },
        { status: 400 }
      );
    }

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

    const slug = await generateSlug(name);

    // 4. Jalankan pembuatan record database secara transaksional
    let createdApp;
    try {
      createdApp = await prisma.$transaction(async (tx) => {
        return tx.application.create({
          data: {
            slug,
            title: title.slice(0, 60),
            name: name.slice(0, 25),
            appType: appType.slice(0, 25),
            tagline: tagline.slice(0, 70),
            features: cleanedFeatures.map((f) => f.slice(0, 60)),
            description: description.slice(0, 200),
            category: prismaCategory,
            iconUrl: savedIconPath!,
            appImage: null,
            url,
          },
        });
      });
    } catch (txError) {
      console.error('Transaksi database gagal saat create aplikasi:', txError);
      if (savedIconPath) {
        await deleteOldIconFile(savedIconPath);
      }
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan aplikasi ke database. Operasi dibatalkan.' },
        { status: 500 }
      );
    }

    const formattedCreated = {
      id: String(createdApp.id),
      dbId: createdApp.id,
      slug: createdApp.slug,
      title: createdApp.title,
      name: createdApp.name,
      appType: createdApp.appType,
      tagline: createdApp.tagline,
      features: parseFeatures(createdApp.features),
      category: createdApp.category,
      description: createdApp.description,
      url: createdApp.url,
      icon: createdApp.iconUrl,
      iconPath: `/api/icon?path=${encodeURIComponent(createdApp.iconUrl)}`,
      rawIconPath: createdApp.iconUrl,
      appImage: null,
      rawAppImage: null,
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
    if (savedIconPath) {
      await deleteOldIconFile(savedIconPath);
    }
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat menambahkan aplikasi' },
      { status: 500 }
    );
  }
}
