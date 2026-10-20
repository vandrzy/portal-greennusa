import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { saveValidatedImage, deleteAssetSafely } from './baseFileStorage';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/gif',
];

export const ALLOWED_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.svg',
  '.gif',
];

export const MAX_ICON_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const INVALID_IMAGE_ERROR_MESSAGE =
  'File icon harus berupa gambar (PNG, JPG, JPEG, WEBP, SVG, atau GIF)';

/**
 * Normalizes category to storage folder name ('pemerintahan' or 'swasta')
 */
export function getCategoryFolder(category: string): 'pemerintahan' | 'swasta' {
  const normalized = category.toLowerCase().trim();
  if (normalized === 'pemerintah' || normalized === 'pemerintahan') {
    return 'pemerintahan';
  }
  return 'swasta';
}

/**
 * Resolves any icon path (relative, encoded, or with /api/icon?path=)
 * to an absolute disk path inside `upload/assets/icons`.
 * Safely guards against directory traversal and Windows root-path misinterpretation.
 */
export function resolveIconDiskPath(iconPath?: string | null): string | null {
  if (!iconPath || typeof iconPath !== 'string') return null;

  try {
    let cleanPath = iconPath;

    // Handle /api/icon?path=...
    if (cleanPath.startsWith('/api/icon?path=')) {
      const url = new URL(`http://localhost${cleanPath}`);
      cleanPath = url.searchParams.get('path') || '';
    }

    cleanPath = decodeURIComponent(cleanPath);

    const relativeClean = cleanPath.replace(/^[\/\\]+/, '');
    const normalizedRelative = path.normalize(relativeClean);

    const expectedBaseRel = path.normalize('assets/icons');
    if (!normalizedRelative.toLowerCase().startsWith(expectedBaseRel.toLowerCase())) {
      return null;
    }

    if (normalizedRelative.includes('..')) {
      return null;
    }

    const fullPath = path.resolve(process.cwd(), 'upload', normalizedRelative);
    const iconsBaseDir = path.resolve(process.cwd(), 'upload', 'assets', 'icons');

    if (!fullPath.toLowerCase().startsWith(iconsBaseDir.toLowerCase())) {
      console.warn('[IconStorage] Attempted access outside icons directory:', fullPath);
      return null;
    }

    return fullPath;
  } catch (e) {
    console.error('[IconStorage] Error resolving disk path:', e);
    return null;
  }
}

/**
 * Validates whether the given file or base64 data represents a valid image.
 */
export function validateImageFile(
  mimeType: string,
  extension: string,
  sizeBytes: number
): void {
  const normMime = mimeType.toLowerCase();
  const normExt = extension.toLowerCase();

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(normMime)) {
    throw new Error(INVALID_IMAGE_ERROR_MESSAGE);
  }

  if (normExt && !ALLOWED_IMAGE_EXTENSIONS.includes(normExt)) {
    throw new Error(INVALID_IMAGE_ERROR_MESSAGE);
  }

  if (sizeBytes <= 0) {
    throw new Error('File icon tidak boleh kosong');
  }

  if (sizeBytes > MAX_ICON_SIZE_BYTES) {
    throw new Error('Ukuran file icon maksimal adalah 5MB');
  }
}

export interface SaveIconResult {
  relativePath: string;
  fullPath: string;
}

/**
 * Saves an uploaded icon file (from FormData File or Base64 Data URL) to the category directory.
 */
export async function saveIconFile(
  fileOrBase64: File | string,
  category: string
): Promise<SaveIconResult> {
  const categoryFolder = getCategoryFolder(category);
  let fileBuffer: Buffer | File;

  if (typeof fileOrBase64 === 'string') {
    const match = fileOrBase64.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
    if (!match) {
      throw new Error(INVALID_IMAGE_ERROR_MESSAGE);
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');
    validateImageFile(mimeType, '.png', buffer.length);
    fileBuffer = buffer;
  } else {
    validateImageFile(fileOrBase64.type, path.extname(fileOrBase64.name), fileOrBase64.size);
    fileBuffer = fileOrBase64;
  }

  const result = await saveValidatedImage(fileBuffer, {
    subFolder: `icons/${categoryFolder}`,
    filePrefix: 'icon',
    maxSizeBytes: MAX_ICON_SIZE_BYTES,
  });

  return {
    relativePath: result.relativePath,
    fullPath: result.fullPath,
  };
}

/**
 * Safely deletes an old icon file from upload/assets/icons directory.
 */
export async function deleteOldIconFile(iconPath?: string | null): Promise<boolean> {
  if (!iconPath || typeof iconPath !== 'string') return false;
  return deleteAssetSafely(iconPath, ['default.png']);
}

/**
 * Copies an existing icon to a new category directory when category is changed without new upload.
 */
export async function copyIconToCategory(
  currentIconPath: string,
  newCategory: string
): Promise<SaveIconResult> {
  const newCategoryFolder = getCategoryFolder(newCategory);
  const targetDir = path.join(process.cwd(), 'upload', 'assets', 'icons', newCategoryFolder);
  await fs.mkdir(targetDir, { recursive: true });

  const sourceFullPath = resolveIconDiskPath(currentIconPath);
  if (!sourceFullPath) {
    throw new Error('Path icon sumber tidak valid');
  }

  const ext = path.extname(sourceFullPath).toLowerCase() || '.png';
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const newFileName = `icon_${Date.now()}_${uniqueId}${ext}`;
  const targetFullPath = path.join(targetDir, newFileName);

  try {
    await fs.access(sourceFullPath);
    await fs.copyFile(sourceFullPath, targetFullPath);
    console.log(`[IconStorage] ✅ Berhasil menyalin icon ke folder kategori baru: ${targetFullPath}`);
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    console.warn(`[IconStorage] Peringatan: File sumber ${sourceFullPath} tidak ditemukan saat salin kategori:`, error.message);
  }

  const relativePath = `/assets/icons/${newCategoryFolder}/${newFileName}`;
  return { relativePath, fullPath: targetFullPath };
}

/**
 * Validates whether the uploaded app image is valid (PNG, JPG, WEBP, SVG, GIF, <= 5MB).
 */
export function validateAppImageFile(file: File): string | null {
  const normMime = file.type.toLowerCase();
  const ext = path.extname(file.name).toLowerCase();

  const isValidMime = ALLOWED_IMAGE_MIME_TYPES.includes(normMime);
  const isValidExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  if (!isValidMime && !isValidExt) {
    return 'Format gambar aplikasi tidak didukung. Gunakan PNG, JPG, WEBP, atau SVG.';
  }

  if (file.size > MAX_ICON_SIZE_BYTES) {
    return 'Ukuran file gambar aplikasi maksimal 5MB.';
  }

  return null;
}

/**
 * Saves an uploaded app banner/preview image to upload/assets/appImages/{category}/
 */
export async function saveAppImageFile(
  fileOrBase64: File | string,
  category: string
): Promise<string> {
  const categoryFolder = getCategoryFolder(category);
  let fileBuffer: Buffer | File;

  if (typeof fileOrBase64 === 'string') {
    const match = fileOrBase64.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Format gambar aplikasi tidak valid');
    }
    const base64Data = match[2];
    fileBuffer = Buffer.from(base64Data, 'base64');
  } else {
    const errorMsg = validateAppImageFile(fileOrBase64);
    if (errorMsg) {
      throw new Error(errorMsg);
    }
    fileBuffer = fileOrBase64;
  }

  const result = await saveValidatedImage(fileBuffer, {
    subFolder: `appImages/${categoryFolder}`,
    filePrefix: 'appimg',
    maxSizeBytes: MAX_ICON_SIZE_BYTES,
  });

  return result.relativePath;
}

/**
 * Deletes an app banner/preview image from upload/assets/appImages/
 */
export async function deleteAppImageFile(imageUrl?: string | null): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  if (!imageUrl.startsWith('/assets/appImages/')) return false;
  return deleteAssetSafely(imageUrl, ['default.png']);
}
