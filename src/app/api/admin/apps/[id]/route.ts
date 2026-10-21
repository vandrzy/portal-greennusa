import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import {
  saveIconFile,
  deleteOldIconFile,
  copyIconToCategory,
  deleteAppImageFile,
  INVALID_IMAGE_ERROR_MESSAGE,
} from '@/lib/iconStorage';
import { AppCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
}

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

async function findApplication(idParam: string) {
  const numId = parseInt(idParam, 10);
  if (!isNaN(numId)) {
    const byId = await prisma.application.findUnique({
      where: { id: numId },
    });
    if (byId) return byId;
  }
  return prisma.application.findUnique({
    where: { slug: idParam },
  });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const { id } = params;
    const app = await findApplication(id);

    if (!app) {
      return NextResponse.json(
        { success: false, message: 'Aplikasi tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/apps/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  let newUploadedIconPath: string | null = null;
  let isNewIconCreated = false;

  try {
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 1. Cek aplikasi lama di database
    const existingApp = await findApplication(id);

    if (!existingApp) {
      return NextResponse.json(
        { success: false, message: 'Aplikasi dengan ID tersebut tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Baca payload update
    const contentType = request.headers.get('content-type') || '';
    let title = existingApp.title;
    let name = existingApp.name;
    let appType = existingApp.appType;
    let tagline = existingApp.tagline;
    let description = existingApp.description;
    let url = existingApp.url;
    let category = existingApp.category;
    let featuresRaw: unknown = existingApp.features;
    let iconInput: File | string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.has('title')) title = String(formData.get('title') ?? '').trim() || title;
      if (formData.has('name')) name = String(formData.get('name') ?? '').trim() || name;
      if (formData.has('appType')) appType = String(formData.get('appType') ?? '').trim() || appType;
      if (formData.has('tagline')) tagline = String(formData.get('tagline') ?? '').trim() || tagline;
      if (formData.has('description')) description = String(formData.get('description') ?? '').trim() || description;
      if (formData.has('url')) url = String(formData.get('url') ?? '').trim() || url;
      if (formData.has('category')) category = (String(formData.get('category') ?? '').trim() as AppCategory) || category;
      if (formData.has('features')) featuresRaw = formData.get('features');
      if (formData.has('icon')) iconInput = formData.get('icon') as File | string | null;
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.title) title = String(body.title).trim();
      if (body.name) name = String(body.name).trim();
      if (body.appType) appType = String(body.appType).trim();
      if (body.tagline) tagline = String(body.tagline).trim();
      if (body.description) description = String(body.description).trim();
      if (body.url) url = String(body.url).trim();
      if (body.category) category = body.category;
      if (body.features !== undefined) featuresRaw = body.features;
      if (body.icon) iconInput = body.icon;
    }

    // Fallback name <-> title
    if (!name && title) name = title;
    if (!title && name) title = name;

    if (!title || !name || !appType || !tagline || !description || !url) {
      return NextResponse.json(
        { success: false, message: 'Judul, nama, jenis aplikasi, tagline, deskripsi, dan URL wajib diisi' },
        { status: 400 }
      );
    }

    if (title.length > 255) {
      return NextResponse.json(
        { success: false, message: 'Judul aplikasi maksimal 255 karakter' },
        { status: 400 }
      );
    }

    if (name.length > 150) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi maksimal 150 karakter' },
        { status: 400 }
      );
    }

    if (appType.length > 150) {
      return NextResponse.json(
        { success: false, message: 'Jenis aplikasi maksimal 150 karakter' },
        { status: 400 }
      );
    }

    if (tagline.length > 255) {
      return NextResponse.json(
        { success: false, message: 'Tagline aplikasi maksimal 255 karakter' },
        { status: 400 }
      );
    }

    const normCategory = String(category).toLowerCase().trim();
    const targetCategory = (normCategory === 'pemerintah' ? 'pemerintahan' : normCategory) as AppCategory;

    // Validasi Keunggulan (Maksimal 4 item)
    const cleanedFeatures = parseFeatures(featuresRaw);
    if (cleanedFeatures.length > 4) {
      return NextResponse.json(
        { success: false, message: 'Keunggulan aplikasi maksimal 4 poin.' },
        { status: 400 }
      );
    }

    // 3. Manajemen file icon
    let finalIconPath = existingApp.iconUrl;
    const oldIconPath = existingApp.iconUrl;

    const hasNewUploadedIcon = Boolean(
      iconInput &&
      (
        (typeof iconInput === 'object' && 'size' in iconInput && (iconInput as { size: number }).size > 0) ||
        (typeof iconInput === 'string' && iconInput.startsWith('data:'))
      )
    );

    if (hasNewUploadedIcon) {
      try {
        const saved = await saveIconFile(iconInput!, targetCategory);
        finalIconPath = saved.relativePath;
        newUploadedIconPath = saved.relativePath;
        isNewIconCreated = true;
      } catch (valErr: unknown) {
        const err = valErr as Error;
        return NextResponse.json(
          { success: false, message: err.message || INVALID_IMAGE_ERROR_MESSAGE },
          { status: 400 }
        );
      }
    } else if (targetCategory !== existingApp.category && oldIconPath) {
      try {
        const copied = await copyIconToCategory(oldIconPath, targetCategory);
        finalIconPath = copied.relativePath;
        newUploadedIconPath = copied.relativePath;
        isNewIconCreated = true;
      } catch (copyErr) {
        console.warn('Gagal menyalin icon ke kategori baru:', copyErr);
      }
    }

    // 4. Jalankan transaksi database (Prisma Transaction)
    let updatedApp;
    try {
      updatedApp = await prisma.$transaction(async (tx) => {
        return tx.application.update({
          where: { id: existingApp.id },
          data: {
            title,
            name,
            appType,
            tagline,
            features: cleanedFeatures,
            category: targetCategory,
            description,
            iconUrl: finalIconPath,
            appImage: null,
            url,
          },
        });
      });
    } catch (txError) {
      console.error('Transaksi database gagal saat update aplikasi:', txError);
      if (isNewIconCreated && newUploadedIconPath) {
        await deleteOldIconFile(newUploadedIconPath);
      }
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui aplikasi di database. Operasi dibatalkan.' },
        { status: 500 }
      );
    }

    // 5. Transaksi database SUKSES -> Hapus file lama yang diganti
    if (isNewIconCreated && oldIconPath && oldIconPath !== finalIconPath) {
      await deleteOldIconFile(oldIconPath);
    }
    if (existingApp.appImage) {
      await deleteAppImageFile(existingApp.appImage);
    }

    const formattedUpdated = {
      id: String(updatedApp.id),
      dbId: updatedApp.id,
      slug: updatedApp.slug,
      title: updatedApp.title,
      name: updatedApp.name,
      appType: updatedApp.appType,
      tagline: updatedApp.tagline,
      features: parseFeatures(updatedApp.features),
      category: updatedApp.category,
      description: updatedApp.description,
      url: updatedApp.url,
      icon: updatedApp.iconUrl,
      iconPath: `/api/icon?path=${encodeURIComponent(updatedApp.iconUrl)}`,
      rawIconPath: updatedApp.iconUrl,
      appImage: null,
      rawAppImage: null,
      createdAt: updatedApp.createdAt,
      updatedAt: updatedApp.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Aplikasi berhasil diperbarui',
        data: formattedUpdated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PUT /api/admin/apps/[id]:', error);
    if (isNewIconCreated && newUploadedIconPath) {
      await deleteOldIconFile(newUploadedIconPath);
    }
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat memperbarui aplikasi' },
      { status: 500 }
    );
  }
}

// Export PATCH to point to the same handler
export const PATCH = PUT;

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 1. Jalankan transaksi database (Prisma Transaction)
    let deletedRecord;
    try {
      deletedRecord = await prisma.$transaction(async (tx) => {
        const existing = await findApplication(id);

        if (!existing) {
          throw new Error('NOT_FOUND');
        }

        await tx.application.delete({
          where: { id: existing.id },
        });

        return existing;
      });
    } catch (txError: unknown) {
      const err = txError as Error;
      if (err.message === 'NOT_FOUND') {
        return NextResponse.json(
          { success: false, message: 'Aplikasi tidak ditemukan' },
          { status: 404 }
        );
      }

      console.error('Transaksi database gagal saat delete aplikasi:', txError);
      return NextResponse.json(
        { success: false, message: 'Gagal menghapus aplikasi dari database' },
        { status: 500 }
      );
    }

    // 2. Penghapusan file fisik icon dan gambar aplikasi lama setelah transaksi DB sukses
    if (deletedRecord && deletedRecord.iconUrl) {
      await deleteOldIconFile(deletedRecord.iconUrl);
    }
    if (deletedRecord && deletedRecord.appImage) {
      await deleteAppImageFile(deletedRecord.appImage);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Aplikasi beserta file asetnya berhasil dihapus',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in DELETE /api/admin/apps/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat menghapus aplikasi' },
      { status: 500 }
    );
  }
}
