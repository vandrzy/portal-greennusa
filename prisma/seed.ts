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

  // 3. Seed data awal Konten Portal berdasarkan konten statis yang ada saat ini
  const portalContentData = {
    logoUrl: '/assets/logo/logo-green.png',
    headerText: 'Satu Pintu Akses Aplikasi GreenNusa Computindo',
    paragraphText:
      'Portal integrasi seluruh layanan digital dan aplikasi ekosistem resmi GreenNusa Computindo guna mendukung efisiensi serta kemudahan akses solusi teknologi bagi instansi pemerintahan dan sektor swasta.',
    folder1Title: 'Pemerintahan',
    folder1Subtitle: 'EKOSISTEM APLIKASI',
    folder2Title: 'Swasta',
    folder2Subtitle: 'EKOSISTEM APLIKASI',
    whatsappLink: 'https://wa.me/6281348039947',
  };

  const portalContent = await prisma.portalContent.upsert({
    where: { id: 1 },
    update: portalContentData,
    create: {
      id: 1,
      ...portalContentData,
    },
  });

  console.log(`📑 Seeded PortalContent: ID ${portalContent.id} (${portalContent.headerText})`);

  // 4. Seed data awal untuk Pengaturan Tema (Theme)
  const defaultThemeData = {
    name: 'Default GreenNusa',
    bgImage: '/assets/backgroundTheme/default.png',
    modalOverlayColor: 'rgba(7, 94, 84, 0.35)',
    isActive: true,
    isDefault: true,
  };

  const existingDefault = await prisma.theme.findFirst({
    where: { isDefault: true },
  });

  let defaultTheme;
  if (existingDefault) {
    defaultTheme = await prisma.theme.update({
      where: { id: existingDefault.id },
      data: defaultThemeData,
    });
  } else {
    defaultTheme = await prisma.theme.create({
      data: defaultThemeData,
    });
  }

  console.log(`🎨 Seeded Theme: ID ${defaultTheme.id} (${defaultTheme.name}, active: ${defaultTheme.isActive})`);

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
