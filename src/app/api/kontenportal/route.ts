import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import { saveLogoFile, deleteOldLogoFile } from '@/lib/logoStorage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/kontenportal
 * Endpoint publik untuk mengambil konfigurasi konten portal aktif.
 * Tidak memerlukan autentikasi login (dapat diakses oleh publik).
 */
export async function GET() {
  try {
    const content = await prisma.portalContent.findFirst({
      orderBy: { id: 'asc' },
    });

    if (!content) {
      return NextResponse.json(
        { success: false, message: 'Konten portal belum tersedia di database' },
        {
          status: 404,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: content.id,
          logoUrl: content.logoUrl,
          headerText: content.headerText,
          paragraphText: content.paragraphText,
          folder1Title: content.folder1Title,
          folder1Subtitle: content.folder1Subtitle,
          folder2Title: content.folder2Title,
          folder2Subtitle: content.folder2Subtitle,
          whatsappLink: content.whatsappLink,
          createdAt: content.createdAt,
          updatedAt: content.updatedAt,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('[API KontenPortal] Error in GET:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan pada server saat memuat konten portal' },
      { status: 500 }
    );
  }
}

/**
 * PUT & POST /api/kontenportal
 * Endpoint admin terproteksi untuk memperbarui konten portal.
 * Mendukung multipart/form-data untuk upload logo baru dan pembaharuan teks secara transaksional.
 */
async function handleUpdateContent(request: NextRequest) {
  let newLogoUrl: string | null = null;

  try {
    // 1. Verifikasi Autentikasi Admin
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    // 2. Parsing Multipart Form Data
    const formData = await request.formData();
    const headerText = (formData.get('headerText') as string | null)?.trim() || '';
    const paragraphText = (formData.get('paragraphText') as string | null)?.trim() || '';
    const folder1Title = (formData.get('folder1Title') as string | null)?.trim() || '';
    const folder1Subtitle = (formData.get('folder1Subtitle') as string | null)?.trim() || '';
    const folder2Title = (formData.get('folder2Title') as string | null)?.trim() || '';
    const folder2Subtitle = (formData.get('folder2Subtitle') as string | null)?.trim() || '';
    const whatsappLink = (formData.get('whatsappLink') as string | null)?.trim() || '';

    const logoEntry = formData.get('logo');
    const logoFile = logoEntry instanceof File && logoEntry.size > 0 ? logoEntry : null;

    // 3. Validasi Field Wajib
    if (
      !headerText ||
      !paragraphText ||
      !folder1Title ||
      !folder1Subtitle ||
      !folder2Title ||
      !folder2Subtitle ||
      !whatsappLink
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Seluruh data wajib diisi: headerText, paragraphText, folder1Title, folder1Subtitle, folder2Title, folder2Subtitle, whatsappLink',
        },
        { status: 400 }
      );
    }

    // 4. Jika ada file logo baru yang diunggah, simpan ke disk terlebih dahulu
    if (logoFile) {
      newLogoUrl = await saveLogoFile(logoFile);
    }

    // 5. Jalankan Database Transaction dengan prisma.$transaction
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.portalContent.findFirst({
        orderBy: { id: 'asc' },
      });

      const oldLogoUrl = existing?.logoUrl ?? null;
      const finalLogoUrl = newLogoUrl ?? existing?.logoUrl ?? '/assets/logo/logo-green.png';

      let updatedRecord;
      if (existing) {
        updatedRecord = await tx.portalContent.update({
          where: { id: existing.id },
          data: {
            logoUrl: finalLogoUrl,
            headerText,
            paragraphText,
            folder1Title,
            folder1Subtitle,
            folder2Title,
            folder2Subtitle,
            whatsappLink,
          },
        });
      } else {
        updatedRecord = await tx.portalContent.create({
          data: {
            logoUrl: finalLogoUrl,
            headerText,
            paragraphText,
            folder1Title,
            folder1Subtitle,
            folder2Title,
            folder2Subtitle,
            whatsappLink,
          },
        });
      }

      return { updatedRecord, oldLogoUrl };
    });

    // 6. Jika transaksi database berhasil dan ada logo baru, hapus logo lama jika berbeda
    if (newLogoUrl && result.oldLogoUrl && result.oldLogoUrl !== newLogoUrl) {
      await deleteOldLogoFile(result.oldLogoUrl);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Konten portal berhasil diperbarui',
        data: result.updatedRecord,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('[API KontenPortal] Error in PUT/POST:', error);

    // Rollback file logo baru jika database transaksi gagal
    if (newLogoUrl) {
      try {
        await deleteOldLogoFile(newLogoUrl);
      } catch (cleanupErr) {
        console.warn('[API KontenPortal] Gagal menghapus file baru saat rollback:', cleanupErr);
      }
    }

    const message = error?.message || 'Terjadi kesalahan pada server saat memperbarui konten portal';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export const PUT = handleUpdateContent;
export const POST = handleUpdateContent;
