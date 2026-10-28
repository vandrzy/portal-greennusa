import { PrismaClient, AppCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ECOSYSTEM_APPS } from '../src/data/ecosystemApps';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // 1. Seed 1 Akun Admin ke tabel `users`
  const hashedPassword = await bcrypt.hash('AdminGreenNusa123!', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@greennusa.id' },
    update: {
      name: 'Administrator GreenNusa',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      name: 'Administrator GreenNusa',
      username: 'admin',
      email: 'admin@greennusa.id',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log(`✅ Akun Admin berhasil dibuat/diperbarui: ${adminUser.email} (ID: ${adminUser.id})`);

  // 2. Gabungkan seluruh aplikasi dari data statis ECOSYSTEM_APPS
  const appsToSeed = ECOSYSTEM_APPS;

  if (appsToSeed.length === 0) {
    throw new Error(
      'Tidak menemukan data aplikasi di src/data/ecosystemApps.ts. Pastikan seluruh record disalin ke dalam seeder.'
    );
  }

  // Bersihkan tabel applications terlebih dahulu agar tidak duplikat saat re-seed
  await prisma.application.deleteMany();

  // Masukkan seluruh aplikasi ke tabel applications
  for (const app of appsToSeed) {
    const createdApp = await prisma.application.create({
      data: {
        slug: app.id,
        title: app.title,
        name: app.name,
        appType: app.appType,
        tagline: app.tagline,
        features: app.features.slice(0, 4),
        description: app.description,
        category: app.category as AppCategory,
        iconUrl: app.icon || app.iconPath || '',
        appImage: null,
        url: app.url,
      },
    });
    console.log(`📦 Seeded Application: [${createdApp.category}] ${createdApp.name} (${createdApp.slug}) -> ID: ${createdApp.id}`);
  }

  // 3. Seed data awal Konten Portal
  const portalContentData = {
    logoUrl: '/assets/logo/logo-green.png',
    whatsappLink: 'https://wa.me/6281348039947',
    requestDemoBadge: 'Layanan Utama',
    requestDemoTitle: 'Request Live Demo & Konsultasi',
    requestDemoDesc:
      'Jadwalkan sesi demo interaktif bersama konsultan IT GreenNusa Computindo atau uji coba langsung aplikasi Pemerintahan & Solusi Bisnis.',
    requestDemoFeatures: [
      'Akses sandbox penuh ke seluruh modul aplikasi',
      'Konsultasi arsitektur sistem & integrasi API',
      'Dukungan penuh untuk iOS, Android & Web Cloud',
      'Estimasi pengembangan & implementasi transparan',
    ],
    buatWebsiteBadge: 'Web Development',
    buatWebsiteTitle: 'Jasa Pembuatan Website & Portal Instansi',
    buatWebsiteDesc:
      'Bangun portal pemerintahan, website korporasi, hingga web app interaktif 3D dengan performa tinggi, keamanan berlapis, dan desain modern.',
    buatWebsiteFeatures: [
      'Desain UI/UX eksklusif & responsif di semua perangkat',
      'Optimasi kecepatan, keamanan SSL & standar SEO',
      'CMS kustom yang mudah dikelola tim internal',
      'Garansi pemeliharaan & dukungan teknis berkala',
    ],
    buatAplikasiBadge: 'Custom Software',
    buatAplikasiTitle: 'Pengembangan Aplikasi iOS, Android & ERP',
    buatAplikasiDesc:
      'Kembangkan aplikasi mobile (Apple iOS & Android) serta sistem informasi manajemen terintegrasi sesuai proses bisnis organisasi Anda.',
    buatAplikasiFeatures: [
      'Aplikasi Native / Hybrid untuk Apple iOS & Android',
      'Integrasi database cloud, pembayaran & GIS spasial',
      'Arsitektur scalable untuk ribuan pengguna serentak',
      'Dokumentasi teknis & pelatihan pengguna lengkap',
    ],
  };

  const portalContent = await prisma.portalContent.upsert({
    where: { id: 1 },
    update: portalContentData,
    create: {
      id: 1,
      ...portalContentData,
    },
  });

  console.log(`📑 Seeded PortalContent: ID ${portalContent.id}`);

  console.log(`🎉 Seeding selesai! Total aplikasi: ${appsToSeed.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
