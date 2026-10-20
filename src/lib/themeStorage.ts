import { saveValidatedImage, deleteAssetSafely } from './baseFileStorage';

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
  const validationError = validateThemeImage(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const result = await saveValidatedImage(file, {
    subFolder: 'backgroundTheme',
    filePrefix: 'theme',
    maxSizeBytes: MAX_FILE_SIZE,
  });

  return result.relativePath;
}

export async function deleteThemeImage(bgImageUrl: string | null | undefined): Promise<void> {
  if (!bgImageUrl) return;
  if (bgImageUrl.includes('default.png')) return;
  if (!bgImageUrl.startsWith('/assets/backgroundTheme/')) return;

  await deleteAssetSafely(bgImageUrl, ['default.png']);
}
