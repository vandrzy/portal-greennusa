import path from 'path';
import { saveValidatedImage, deleteAssetSafely } from './baseFileStorage';

export const ALLOWED_LOGO_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

export const ALLOWED_LOGO_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
];

export const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const INVALID_LOGO_ERROR_MESSAGE =
  'File logo harus berupa gambar yang valid (PNG, JPG, JPEG, WEBP, atau SVG) dengan ukuran maksimal 5MB';

/**
 * Saves an uploaded logo File into `upload/assets/logo/` with a unique filename.
 * Returns the public URL path (e.g. `/assets/logo/logo_1729340000000_a1b2c3.png`).
 */
export async function saveLogoFile(file: File): Promise<string> {
  const mimeType = (file.type || '').toLowerCase();
  const ext = (path.extname(file.name) || '').toLowerCase() || '.png';

  if (
    !ALLOWED_LOGO_MIME_TYPES.includes(mimeType) &&
    !ALLOWED_LOGO_EXTENSIONS.includes(ext)
  ) {
    throw new Error(INVALID_LOGO_ERROR_MESSAGE);
  }

  if (file.size > MAX_LOGO_SIZE_BYTES) {
    throw new Error('Ukuran file logo melebihi batas maksimal 5MB');
  }

  const result = await saveValidatedImage(file, {
    subFolder: 'logo',
    filePrefix: 'logo',
    maxSizeBytes: MAX_LOGO_SIZE_BYTES,
  });

  return result.relativePath;
}

/**
 * Deletes an old logo file from disk.
 * Safe against path traversal and preserves default template assets (logo-green.png).
 */
export async function deleteOldLogoFile(logoUrl?: string | null): Promise<void> {
  if (!logoUrl || typeof logoUrl !== 'string') return;
  await deleteAssetSafely(logoUrl, ['logo-green.png', 'logo green.png', 'default.png']);
}
