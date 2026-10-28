import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthSessionFromRequest } from '@/lib/auth';
import { saveLogoFile, deleteOldLogoFile } from '@/lib/logoStorage';

export const dynamic = 'force-dynamic';

const parseFeatures = (val: unknown): string[] => {
  if (Array.isArray(val)) {
    return val.map((x) => String(x).trim()).filter(Boolean).slice(0, 4);
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map((x) => String(x).trim()).filter(Boolean).slice(0, 4);
      }
    } catch {
      return val
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 4);
    }
  }
  return [];
};

/**
 * GET /api/kontenportal
 * Mengambil konfigurasi konten portal (publik).
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

    const requestDemoFeatures = parseFeatures(content.requestDemoFeatures);
    const buatWebsiteFeatures = parseFeatures(content.buatWebsiteFeatures);
    const buatAplikasiFeatures = parseFeatures(content.buatAplikasiFeatures);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: content.id,
          logoUrl: content.logoUrl,
          whatsappLink: content.whatsappLink,

          // Modal 1: Request Demo
          requestDemoBadge: content.requestDemoBadge || 'Layanan Utama',
          requestDemoTitle: content.requestDemoTitle || 'Request Live Demo & Konsultasi',
          requestDemoDesc:
            content.requestDemoDesc ||
            'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
          requestDemoFeatures:
            requestDemoFeatures.length > 0
              ? requestDemoFeatures
              : [
                  'Akses sandbox penuh ke seluruh modul aplikasi',
                  'Konsultasi arsitektur sistem & integrasi API',
                  'Dukungan penuh untuk iOS, Android & Web Cloud',
                  'Estimasi pengembangan & implementasi transparan',
                ],

          // Modal 2: Jasa Buat Website
          buatWebsiteBadge: content.buatWebsiteBadge || 'Web Development',
          buatWebsiteTitle: content.buatWebsiteTitle || 'Jasa Pembuatan Website & Portal Instansi',
          buatWebsiteDesc:
            content.buatWebsiteDesc ||
            'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
          buatWebsiteFeatures:
            buatWebsiteFeatures.length > 0
              ? buatWebsiteFeatures
              : [
                  'Desain UI/UX eksklusif & responsif di semua perangkat',
                  'Optimasi kecepatan, keamanan SSL & standar SEO',
                  'CMS kustom yang mudah dikelola tim internal',
                  'Garansi pemeliharaan & dukungan teknis berkala',
                ],

          // Modal 3: Buat Aplikasi Custom
          buatAplikasiBadge: content.buatAplikasiBadge || 'Custom Software',
          buatAplikasiTitle: content.buatAplikasiTitle || 'Pengembangan Aplikasi iOS, Android & ERP',
          buatAplikasiDesc:
            content.buatAplikasiDesc ||
            'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
          buatAplikasiFeatures:
            buatAplikasiFeatures.length > 0
              ? buatAplikasiFeatures
              : [
                  'Aplikasi Native / Hybrid untuk Apple iOS & Android',
                  'Integrasi database cloud, pembayaran & GIS spasial',
                  'Arsitektur scalable untuk ribuan pengguna serentak',
                  'Dokumentasi teknis & pelatihan pengguna lengkap',
                ],

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
 * PATCH / PUT / POST /api/kontenportal
 * Endpoint terproteksi (hanya admin login) untuk memperbarui konten portal dan ketiga modal.
 */
async function handleUpdateContent(request: NextRequest) {
  let newLogoUrl: string | null = null;

  try {
    // 1. Verifikasi Autentikasi Admin (Wajib Login)
    const session = await getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Sesi admin tidak valid atau telah kedaluwarsa' },
        { status: 401 }
      );
    }

    const contentType = request.headers.get('content-type') || '';
    let whatsappLink = '';
    let requestDemoBadge = '';
    let requestDemoTitle = '';
    let requestDemoDesc = '';
    let requestDemoFeatures: string[] = [];

    let buatWebsiteBadge = '';
    let buatWebsiteTitle = '';
    let buatWebsiteDesc = '';
    let buatWebsiteFeatures: string[] = [];

    let buatAplikasiBadge = '';
    let buatAplikasiTitle = '';
    let buatAplikasiDesc = '';
    let buatAplikasiFeatures: string[] = [];

    let logoFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      whatsappLink = (formData.get('whatsappLink') as string | null)?.trim() || '';

      requestDemoBadge = (formData.get('requestDemoBadge') as string | null)?.trim() || '';
      requestDemoTitle = (formData.get('requestDemoTitle') as string | null)?.trim() || '';
      requestDemoDesc = (formData.get('requestDemoDesc') as string | null)?.trim() || '';
      requestDemoFeatures = parseFeatures(formData.get('requestDemoFeatures'));

      buatWebsiteBadge = (formData.get('buatWebsiteBadge') as string | null)?.trim() || '';
      buatWebsiteTitle = (formData.get('buatWebsiteTitle') as string | null)?.trim() || '';
      buatWebsiteDesc = (formData.get('buatWebsiteDesc') as string | null)?.trim() || '';
      buatWebsiteFeatures = parseFeatures(formData.get('buatWebsiteFeatures'));

      buatAplikasiBadge = (formData.get('buatAplikasiBadge') as string | null)?.trim() || '';
      buatAplikasiTitle = (formData.get('buatAplikasiTitle') as string | null)?.trim() || '';
      buatAplikasiDesc = (formData.get('buatAplikasiDesc') as string | null)?.trim() || '';
      buatAplikasiFeatures = parseFeatures(formData.get('buatAplikasiFeatures'));

      const logoEntry = formData.get('logo');
      if (logoEntry instanceof File && logoEntry.size > 0) {
        logoFile = logoEntry;
      }
    } else {
      const body = await request.json().catch(() => ({}));
      whatsappLink = String(body.whatsappLink || '').trim();

      requestDemoBadge = String(body.requestDemoBadge || '').trim();
      requestDemoTitle = String(body.requestDemoTitle || '').trim();
      requestDemoDesc = String(body.requestDemoDesc || '').trim();
      requestDemoFeatures = parseFeatures(body.requestDemoFeatures);

      buatWebsiteBadge = String(body.buatWebsiteBadge || '').trim();
      buatWebsiteTitle = String(body.buatWebsiteTitle || '').trim();
      buatWebsiteDesc = String(body.buatWebsiteDesc || '').trim();
      buatWebsiteFeatures = parseFeatures(body.buatWebsiteFeatures);

      buatAplikasiBadge = String(body.buatAplikasiBadge || '').trim();
      buatAplikasiTitle = String(body.buatAplikasiTitle || '').trim();
      buatAplikasiDesc = String(body.buatAplikasiDesc || '').trim();
      buatAplikasiFeatures = parseFeatures(body.buatAplikasiFeatures);
    }

    // 2. Validasi Batas Karakter (Backend Enforcement)
    // - Form badge: maksimal 20 karakter
    if (requestDemoBadge.length > 20) {
      return NextResponse.json(
        { success: false, message: 'Badge Request Demo maksimal 20 karakter' },
        { status: 400 }
      );
    }
    if (buatWebsiteBadge.length > 20) {
      return NextResponse.json(
        { success: false, message: 'Badge Jasa Buat Website maksimal 20 karakter' },
        { status: 400 }
      );
    }
    if (buatAplikasiBadge.length > 20) {
      return NextResponse.json(
        { success: false, message: 'Badge Buat Aplikasi Custom maksimal 20 karakter' },
        { status: 400 }
      );
    }

    // - Form judul/header: maksimal 45 karakter
    if (requestDemoTitle.length > 45) {
      return NextResponse.json(
        { success: false, message: 'Judul/Header Request Demo maksimal 45 karakter' },
        { status: 400 }
      );
    }
    if (buatWebsiteTitle.length > 45) {
      return NextResponse.json(
        { success: false, message: 'Judul/Header Jasa Buat Website maksimal 45 karakter' },
        { status: 400 }
      );
    }
    if (buatAplikasiTitle.length > 45) {
      return NextResponse.json(
        { success: false, message: 'Judul/Header Buat Aplikasi Custom maksimal 45 karakter' },
        { status: 400 }
      );
    }

    // - Form paragraf penjelasan: maksimal 175 karakter
    if (requestDemoDesc.length > 175) {
      return NextResponse.json(
        { success: false, message: 'Paragraf penjelasan Request Demo maksimal 175 karakter' },
        { status: 400 }
      );
    }
    if (buatWebsiteDesc.length > 175) {
      return NextResponse.json(
        { success: false, message: 'Paragraf penjelasan Jasa Buat Website maksimal 175 karakter' },
        { status: 400 }
      );
    }
    if (buatAplikasiDesc.length > 175) {
      return NextResponse.json(
        { success: false, message: 'Paragraf penjelasan Buat Aplikasi Custom maksimal 175 karakter' },
        { status: 400 }
      );
    }

    // - Form tiap daftar layanan: maksimal 60 karakter
    if (requestDemoFeatures.some((item) => item.length > 60)) {
      return NextResponse.json(
        { success: false, message: 'Tiap item daftar layanan Request Demo maksimal 60 karakter' },
        { status: 400 }
      );
    }
    if (buatWebsiteFeatures.some((item) => item.length > 60)) {
      return NextResponse.json(
        { success: false, message: 'Tiap item daftar layanan Jasa Buat Website maksimal 60 karakter' },
        { status: 400 }
      );
    }
    if (buatAplikasiFeatures.some((item) => item.length > 60)) {
      return NextResponse.json(
        { success: false, message: 'Tiap item daftar layanan Buat Aplikasi Custom maksimal 60 karakter' },
        { status: 400 }
      );
    }

    // 3. Simpan file logo baru jika ada
    if (logoFile) {
      newLogoUrl = await saveLogoFile(logoFile);
    }

    // 4. Update database
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.portalContent.findFirst({
        orderBy: { id: 'asc' },
      });

      const oldLogoUrl = existing?.logoUrl ?? null;
      const finalLogoUrl = newLogoUrl ?? existing?.logoUrl ?? '/assets/logo/logo-green.png';
      const finalWhatsapp = whatsappLink || existing?.whatsappLink || 'https://wa.me/6281348039947';

      const updateData = {
        logoUrl: finalLogoUrl,
        whatsappLink: finalWhatsapp,
        requestDemoBadge: requestDemoBadge ? requestDemoBadge.slice(0, 20) : (existing?.requestDemoBadge || 'Layanan Utama'),
        requestDemoTitle: requestDemoTitle ? requestDemoTitle.slice(0, 45) : (existing?.requestDemoTitle || 'Request Live Demo & Konsultasi'),
        requestDemoDesc: requestDemoDesc
          ? requestDemoDesc.slice(0, 175)
          : (existing?.requestDemoDesc ||
            'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.'),
        requestDemoFeatures: requestDemoFeatures.length > 0 ? requestDemoFeatures.map((f) => f.slice(0, 60)) : (existing?.requestDemoFeatures ?? []),

        buatWebsiteBadge: buatWebsiteBadge ? buatWebsiteBadge.slice(0, 20) : (existing?.buatWebsiteBadge || 'Web Development'),
        buatWebsiteTitle: buatWebsiteTitle ? buatWebsiteTitle.slice(0, 45) : (existing?.buatWebsiteTitle || 'Jasa Pembuatan Website & Portal Instansi'),
        buatWebsiteDesc: buatWebsiteDesc
          ? buatWebsiteDesc.slice(0, 175)
          : (existing?.buatWebsiteDesc ||
            'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.'),
        buatWebsiteFeatures: buatWebsiteFeatures.length > 0 ? buatWebsiteFeatures.map((f) => f.slice(0, 60)) : (existing?.buatWebsiteFeatures ?? []),

        buatAplikasiBadge: buatAplikasiBadge ? buatAplikasiBadge.slice(0, 20) : (existing?.buatAplikasiBadge || 'Custom Software'),
        buatAplikasiTitle: buatAplikasiTitle ? buatAplikasiTitle.slice(0, 45) : (existing?.buatAplikasiTitle || 'Pengembangan Aplikasi iOS, Android & ERP'),
        buatAplikasiDesc: buatAplikasiDesc
          ? buatAplikasiDesc.slice(0, 175)
          : (existing?.buatAplikasiDesc ||
            'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.'),
        buatAplikasiFeatures: buatAplikasiFeatures.length > 0 ? buatAplikasiFeatures.map((f) => f.slice(0, 60)) : (existing?.buatAplikasiFeatures ?? []),
      };

      let updatedRecord;
      if (existing) {
        updatedRecord = await tx.portalContent.update({
          where: { id: existing.id },
          data: updateData,
        });
      } else {
        updatedRecord = await tx.portalContent.create({
          data: updateData,
        });
      }

      return { updatedRecord, oldLogoUrl };
    });

    if (newLogoUrl && result.oldLogoUrl && result.oldLogoUrl !== newLogoUrl) {
      await deleteOldLogoFile(result.oldLogoUrl);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Konten portal dan modal berhasil diperbarui',
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
    console.error('[API KontenPortal] Error in PATCH/PUT/POST:', error);

    if (newLogoUrl) {
      try {
        await deleteOldLogoFile(newLogoUrl);
      } catch (cleanupErr) {
        console.warn('[API KontenPortal] Gagal menghapus file baru saat rollback:', cleanupErr);
      }
    }

    return NextResponse.json(
      { success: false, message: error?.message || 'Terjadi kesalahan pada server saat memperbarui konten portal' },
      { status: 500 }
    );
  }
}

export const PATCH = handleUpdateContent;
export const PUT = handleUpdateContent;
export const POST = handleUpdateContent;
