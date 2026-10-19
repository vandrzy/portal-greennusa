import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import {
  saveIconFile,
  deleteOldIconFile,
  copyIconToCategory,
  INVALID_IMAGE_ERROR_MESSAGE,
} from '@/lib/iconStorage';
import { AppCategory } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: {
    id: string;
  };
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
    const app = await prisma.app.findUnique({
      where: { id },
    });

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
  let newUploadedFilePath: string | null = null;
  let isNewFileCreated = false;

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
    const existingApp = await prisma.app.findUnique({
      where: { id },
    });

    if (!existingApp) {
      return NextResponse.json(
        { success: false, message: 'Aplikasi dengan ID tersebut tidak ditemukan' },
        { status: 404 }
      );
    }

    // 2. Baca payload update
    const contentType = request.headers.get('content-type') || '';
    let title = existingApp.title;
    let description = existingApp.description;
    let url = existingApp.url;
    let category = existingApp.category;
    let iconInput: File | string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.has('title')) title = (formData.get('title') as string) || title;
      if (formData.has('name')) title = (formData.get('name') as string) || title;
      if (formData.has('description')) description = (formData.get('description') as string) || description;
      if (formData.has('url')) url = (formData.get('url') as string) || url;
      if (formData.has('category')) category = (formData.get('category') as AppCategory) || category;
      if (formData.has('icon')) iconInput = formData.get('icon') as File | string | null;
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.title || body.name) title = body.title || body.name;
      if (body.description) description = body.description;
      if (body.url) url = body.url;
      if (body.category) category = body.category;
      if (body.icon) iconInput = body.icon;
    }

    if (!title.trim() || !description.trim() || !url.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi, deskripsi, dan URL wajib diisi' },
        { status: 400 }
      );
    }

    const normCategory = category.toLowerCase().trim();
    const targetCategory = (normCategory === 'pemerintah' ? 'pemerintahan' : normCategory) as AppCategory;

    // 3. Manajemen file icon baru / perpindahan kategori
    let finalIconPath = existingApp.iconPath;
    const oldIconPath = existingApp.iconPath;

    const hasNewUploadedFile = Boolean(
      iconInput &&
      (
        (typeof iconInput === 'object' && 'size' in iconInput && (iconInput as { size: number }).size > 0) ||
        (typeof iconInput === 'string' && iconInput.startsWith('data:'))
      )
    );

    if (hasNewUploadedFile) {
      // User mengunggah file gambar baru
      try {
        const saved = await saveIconFile(iconInput!, targetCategory);
        finalIconPath = saved.relativePath;
        newUploadedFilePath = saved.relativePath;
        isNewFileCreated = true;
      } catch (valErr: unknown) {
        const err = valErr as Error;
        return NextResponse.json(
          { success: false, message: err.message || INVALID_IMAGE_ERROR_MESSAGE },
          { status: 400 }
        );
      }
    } else if (targetCategory !== existingApp.category) {
      // User memindahkan kategori tanpa upload gambar baru -> salin icon ke folder kategori baru
      try {
        const copied = await copyIconToCategory(oldIconPath, targetCategory);
        finalIconPath = copied.relativePath;
        newUploadedFilePath = copied.relativePath;
        isNewFileCreated = true;
      } catch (copyErr) {
        console.warn('Gagal menyalin icon ke kategori baru:', copyErr);
      }
    }

    // 4. Jalankan transaksi database (Prisma Transaction)
    let updatedApp;
    try {
      updatedApp = await prisma.$transaction(async (tx) => {
        return tx.app.update({
          where: { id },
          data: {
            title: title.trim(),
            description: description.trim(),
            url: url.trim(),
            category: targetCategory,
            iconPath: finalIconPath,
          },
        });
      });
    } catch (txError) {
      console.error('Transaksi database gagal saat update aplikasi:', txError);
      // ROLLBACK: Hapus file icon baru jika database gagal update
      if (isNewFileCreated && newUploadedFilePath) {
        await deleteOldIconFile(newUploadedFilePath);
      }
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui aplikasi di database. Operasi dibatalkan.' },
        { status: 500 }
      );
    }

    // 5. Transaksi database SUKSES -> Hapus file icon lama dari disk jika diganti
    if (isNewFileCreated && oldIconPath && oldIconPath !== finalIconPath) {
      await deleteOldIconFile(oldIconPath);
    }

    const formattedUpdated = {
      id: updatedApp.id,
      title: updatedApp.title,
      description: updatedApp.description,
      url: updatedApp.url,
      category: updatedApp.category,
      iconPath: `/api/icon?path=${encodeURIComponent(updatedApp.iconPath)}`,
      rawIconPath: updatedApp.iconPath,
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
    if (isNewFileCreated && newUploadedFilePath) {
      await deleteOldIconFile(newUploadedFilePath);
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
        const existing = await tx.app.findUnique({
          where: { id },
        });

        if (!existing) {
          throw new Error('NOT_FOUND');
        }

        await tx.app.delete({
          where: { id },
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

    // 2. Penghapusan file fisik icon lama setelah transaksi DB sukses committed
    if (deletedRecord && deletedRecord.iconPath) {
      await deleteOldIconFile(deletedRecord.iconPath);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Aplikasi dan icon berhasil dihapus',
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
