import { PrismaClient, AppCategory } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { PEMERINTAHAN_APPS, SWASTA_APPS } from '../src/data/ecosystemApps';

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

  // 2. Gabungkan seluruh aplikasi dari data statis
  const appsToSeed = [...PEMERINTAHAN_APPS, ...SWASTA_APPS];

  if (appsToSeed.length === 0) {
    throw new Error(
      'Tidak menemukan data aplikasi di src/data/ecosystemApps.ts. Pastikan seluruh record disalin ke dalam seeder.'
    );
  }

  // Bersihkan tabel apps terlebih dahulu agar tidak duplikat saat re-seed
  await prisma.app.deleteMany();

  // Masukkan seluruh aplikasi (UUID di-generate otomatis oleh Prisma)
  for (const app of appsToSeed) {
    const createdApp = await prisma.app.create({
      data: {
        title: app.title,
        description: app.description,
        url: app.url,
        category: app.category as AppCategory,
        iconPath: app.iconPath,
      },
    });
    console.log(`📦 Seeded App: [${createdApp.category}] ${createdApp.title} -> UUID: ${createdApp.id}`);
  }

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
