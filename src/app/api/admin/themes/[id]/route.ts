import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth';
import { validateThemeImage, saveThemeImage, deleteThemeImage } from '@/lib/themeStorage';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existingTheme = await prisma.theme.findUnique({ where: { id } });

    if (!existingTheme) {
      return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 });
    }

    if (existingTheme.isDefault) {
      return NextResponse.json(
        { error: 'Tema default tidak dapat diedit' },
        { status: 403 }
      );
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

    let bgImagePath = existingTheme.bgImage;

    // Jika ada upload gambar baru: hapus gambar lama dulu, baru simpan gambar baru
    if (bgFile && bgFile.size > 0) {
      const validationError = validateThemeImage(bgFile);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      await deleteThemeImage(existingTheme.bgImage);
      bgImagePath = await saveThemeImage(bgFile);
    }

    const updatedTheme = await prisma.$transaction(async (tx) => {
      if (isActive) {
        await tx.theme.updateMany({
          where: { id: { not: id } },
          data: { isActive: false },
        });
      } else if (existingTheme.isActive && !isActive) {
        // Jika tema yang sedang aktif dinonaktifkan, maka tema default menjadi aktif
        await tx.theme.updateMany({
          where: { isDefault: true },
          data: { isActive: true },
        });
      }

      return tx.theme.update({
        where: { id },
        data: {
          name,
          bgImage: bgImagePath,
          modalOverlayColor,
          isActive,
        },
      });
    });

    return NextResponse.json({ theme: updatedTheme });
  } catch (error) {
    console.error('Error PUT /api/admin/themes/[id]:', error);
    return NextResponse.json({ error: 'Gagal memperbarui tema' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const isActive = Boolean(body.isActive);

    const existingTheme = await prisma.theme.findUnique({ where: { id } });
    if (!existingTheme) {
      return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 });
    }

    if (existingTheme.isDefault && !isActive) {
      return NextResponse.json(
        { error: 'Tema default tidak dapat dinonaktifkan secara langsung.' },
        { status: 400 }
      );
    }

    const updatedTheme = await prisma.$transaction(async (tx) => {
      if (isActive) {
        // Nonaktifkan tema lain yang sedang aktif
        await tx.theme.updateMany({
          where: { id: { not: id } },
          data: { isActive: false },
        });
        return tx.theme.update({
          where: { id },
          data: { isActive: true },
        });
      } else {
        // Nonaktifkan tema ini dan aktifkan tema default
        const updated = await tx.theme.update({
          where: { id },
          data: { isActive: false },
        });
        await tx.theme.updateMany({
          where: { isDefault: true },
          data: { isActive: true },
        });
        return updated;
      }
    });

    return NextResponse.json({ theme: updatedTheme });
  } catch (error) {
    console.error('Error PATCH /api/admin/themes/[id]:', error);
    return NextResponse.json({ error: 'Gagal mengubah status tema' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existingTheme = await prisma.theme.findUnique({ where: { id } });

    if (!existingTheme) {
      return NextResponse.json({ error: 'Tema tidak ditemukan' }, { status: 404 });
    }

    if (existingTheme.isDefault) {
      return NextResponse.json(
        { error: 'Tema default tidak dapat dihapus' },
        { status: 403 }
      );
    }

    // 1. Pastikan gambar lama dihapus terlebih dahulu dari disk
    await deleteThemeImage(existingTheme.bgImage);

    // 2. Hapus data dari database menggunakan transaksi
    await prisma.$transaction(async (tx) => {
      await tx.theme.delete({ where: { id } });

      // Jika tema yang dihapus sedang aktif, aktifkan kembali tema default
      if (existingTheme.isActive) {
        await tx.theme.updateMany({
          where: { isDefault: true },
          data: { isActive: true },
        });
      }
    });

    return NextResponse.json({ message: 'Tema berhasil dihapus' });
  } catch (error) {
    console.error('Error DELETE /api/admin/themes/[id]:', error);
    return NextResponse.json({ error: 'Gagal menghapus tema' }, { status: 500 });
  }
}
