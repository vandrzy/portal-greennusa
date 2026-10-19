import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import {
  saveIconFile,
  deleteOldIconFile,
  copyIconToCategory,
  saveAppImageFile,
  deleteAppImageFile,
  validateAppImageFile,
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
  let newUploadedAppImagePath: string | null = null;
  let isNewAppImageCreated = false;

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
    let appImageInput: File | string | null = null;
    let removeAppImage = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      if (formData.has('title')) title = (formData.get('title') as string) || title;
      if (formData.has('name')) title = (formData.get('name') as string) || title;
      if (formData.has('description')) description = (formData.get('description') as string) || description;
      if (formData.has('url')) url = (formData.get('url') as string) || url;
      if (formData.has('category')) category = (formData.get('category') as AppCategory) || category;
      if (formData.has('icon')) iconInput = formData.get('icon') as File | string | null;
      if (formData.has('appImageFile')) appImageInput = formData.get('appImageFile') as File | string | null;
      else if (formData.has('appImage')) appImageInput = formData.get('appImage') as File | string | null;
      if (formData.has('removeAppImage')) removeAppImage = formData.get('removeAppImage') === 'true';
    } else {
      const body = await request.json().catch(() => ({}));
      if (body.title || body.name) title = body.title || body.name;
      if (body.description) description = body.description;
      if (body.url) url = body.url;
      if (body.category) category = body.category;
      if (body.icon) iconInput = body.icon;
      if (body.appImageFile) appImageInput = body.appImageFile;
      else if (body.appImage) appImageInput = body.appImage;
      if (body.removeAppImage) removeAppImage = Boolean(body.removeAppImage);
    }

    if (!title.trim() || !description.trim() || !url.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama aplikasi, deskripsi, dan URL wajib diisi' },
        { status: 400 }
      );
    }

    const normCategory = category.toLowerCase().trim();
    const targetCategory = (normCategory === 'pemerintah' ? 'pemerintahan' : normCategory) as AppCategory;

    // 3. Manajemen file icon
    let finalIconPath = existingApp.iconPath;
    const oldIconPath = existingApp.iconPath;

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
    } else if (targetCategory !== existingApp.category) {
      try {
        const copied = await copyIconToCategory(oldIconPath, targetCategory);
        finalIconPath = copied.relativePath;
        newUploadedIconPath = copied.relativePath;
        isNewIconCreated = true;
      } catch (copyErr) {
        console.warn('Gagal menyalin icon ke kategori baru:', copyErr);
      }
    }

    // 4. Manajemen file gambar aplikasi (appImage)
    let finalAppImagePath = existingApp.appImage;
    const oldAppImagePath = existingApp.appImage;

    const hasNewUploadedAppImage = Boolean(
      appImageInput &&
      (
        (typeof appImageInput === 'object' && 'size' in appImageInput && (appImageInput as { size: number }).size > 0) ||
        (typeof appImageInput === 'string' && appImageInput.startsWith('data:'))
      )
    );

    if (hasNewUploadedAppImage && appImageInput) {
      if (typeof appImageInput === 'object' && 'size' in appImageInput) {
        const imgError = validateAppImageFile(appImageInput as File);
        if (imgError) {
          if (isNewIconCreated && newUploadedIconPath) await deleteOldIconFile(newUploadedIconPath);
          return NextResponse.json({ success: false, message: imgError }, { status: 400 });
        }
      }
      try {
        const saved = await saveAppImageFile(appImageInput!, targetCategory);
        finalAppImagePath = saved;
        newUploadedAppImagePath = saved;
        isNewAppImageCreated = true;
      } catch (imgSaveErr: unknown) {
        const err = imgSaveErr as Error;
        if (isNewIconCreated && newUploadedIconPath) await deleteOldIconFile(newUploadedIconPath);
        return NextResponse.json(
          { success: false, message: err.message || 'Gagal menyimpan gambar aplikasi' },
          { status: 400 }
        );
      }
    } else if (removeAppImage) {
      finalAppImagePath = null;
    }

    // 5. Jalankan transaksi database (Prisma Transaction)
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
            appImage: finalAppImagePath,
          },
        });
      });
    } catch (txError) {
      console.error('Transaksi database gagal saat update aplikasi:', txError);
      // ROLLBACK: Hapus file fisik baru jika database gagal update
      if (isNewIconCreated && newUploadedIconPath) {
        await deleteOldIconFile(newUploadedIconPath);
      }
      if (isNewAppImageCreated && newUploadedAppImagePath) {
        await deleteAppImageFile(newUploadedAppImagePath);
      }
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui aplikasi di database. Operasi dibatalkan.' },
        { status: 500 }
      );
    }

    // 6. Transaksi database SUKSES -> Hapus file lama yang diganti/dihapus
    if (isNewIconCreated && oldIconPath && oldIconPath !== finalIconPath) {
      await deleteOldIconFile(oldIconPath);
    }
    if ((isNewAppImageCreated || removeAppImage) && oldAppImagePath && oldAppImagePath !== finalAppImagePath) {
      await deleteAppImageFile(oldAppImagePath);
    }

    const formattedUpdated = {
      id: updatedApp.id,
      title: updatedApp.title,
      name: updatedApp.title,
      description: updatedApp.description,
      url: updatedApp.url,
      category: updatedApp.category,
      iconPath: `/api/icon?path=${encodeURIComponent(updatedApp.iconPath)}`,
      rawIconPath: updatedApp.iconPath,
      appImage: updatedApp.appImage ?? null,
      rawAppImage: updatedApp.appImage ?? null,
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
    if (isNewAppImageCreated && newUploadedAppImagePath) {
      await deleteAppImageFile(newUploadedAppImagePath);
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

    // 2. Penghapusan file fisik icon dan gambar aplikasi lama setelah transaksi DB sukses
    if (deletedRecord && deletedRecord.iconPath) {
      await deleteOldIconFile(deletedRecord.iconPath);
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
