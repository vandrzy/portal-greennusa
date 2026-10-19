import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/webp': '.webp',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateThemeImage(file: File): string | null {
  if (!ALLOWED_MIME_TYPES[file.type]) {
    return 'Format file tidak didukung. Gunakan PNG, JPG, atau WEBP.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran gambar maksimal 5MB.';
  }
  return null;
}

export async function saveThemeImage(file: File): Promise<string> {
  const ext = ALLOWED_MIME_TYPES[file.type] || '.png';
  const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const filename = `theme_${uniqueSuffix}${ext}`;

  const dirPath = path.join(process.cwd(), 'public', 'assets', 'backgroundTheme');
  await fs.mkdir(dirPath, { recursive: true });

  const filePath = path.join(dirPath, filename);
  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return `/assets/backgroundTheme/${filename}`;
}

export async function deleteThemeImage(bgImageUrl: string | null | undefined): Promise<void> {
  if (!bgImageUrl) return;
  // Jangan pernah hapus gambar default!
  if (bgImageUrl.includes('default.png')) return;
  if (!bgImageUrl.startsWith('/assets/backgroundTheme/')) return;

  try {
    const cleanRelativePath = bgImageUrl.replace(/^\//, '');
    const fullPath = path.join(process.cwd(), 'public', cleanRelativePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.warn('Gagal menghapus file gambar tema lama atau file tidak ditemukan:', error);
  }
}
