import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

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
 * to an absolute disk path inside `public/assets/icons`.
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

    // Decode URI components (e.g. %20 -> space)
    cleanPath = decodeURIComponent(cleanPath);

    // Strip leading forward slashes AND backslashes to avoid Windows root resolution
    const relativeClean = cleanPath.replace(/^[\/\\]+/, '');
    const normalizedRelative = path.normalize(relativeClean);

    // Security check: Must belong to assets/icons
    const expectedBaseRel = path.normalize('assets/icons');
    if (!normalizedRelative.toLowerCase().startsWith(expectedBaseRel.toLowerCase())) {
      return null;
    }

    // Prevent path traversal
    if (normalizedRelative.includes('..')) {
      return null;
    }

    const fullPath = path.resolve(process.cwd(), 'upload', normalizedRelative);
    const iconsBaseDir = path.resolve(process.cwd(), 'upload', 'assets', 'icons');

    // Case-insensitive check for Windows drive letters and paths
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

  if (!ALLOWED_IMAGE_EXTENSIONS.includes(normExt)) {
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
  const targetDir = path.join(process.cwd(), 'upload', 'assets', 'icons', categoryFolder);

  // Ensure directory exists
  await fs.mkdir(targetDir, { recursive: true });

  let fileBuffer: Buffer;
  let fileExt = '.png';

  if (typeof fileOrBase64 === 'string') {
    // Check if it's a Base64 Data URL
    const match = fileOrBase64.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
    if (!match) {
      throw new Error(INVALID_IMAGE_ERROR_MESSAGE);
    }

    const mimeType = match[1];
    const base64Data = match[2];
    fileBuffer = Buffer.from(base64Data, 'base64');

    const mimeToExt: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/gif': '.gif',
    };

    fileExt = mimeToExt[mimeType] || '';
    validateImageFile(mimeType, fileExt, fileBuffer.length);
  } else {
    // It's a standard File object from FormData
    const file = fileOrBase64;
    const mimeType = file.type;
    fileExt = path.extname(file.name).toLowerCase();

    // In case extension is missing from filename, derive from mimeType
    if (!fileExt) {
      const mimeToExt: Record<string, string> = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/webp': '.webp',
        'image/svg+xml': '.svg',
        'image/gif': '.gif',
      };
      fileExt = mimeToExt[mimeType] || '.png';
    }

    validateImageFile(mimeType, fileExt, file.size);

    const arrayBuffer = await file.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  }

  // Generate unique filename to avoid collisions and caching issues
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const fileName = `icon_${Date.now()}_${uniqueId}${fileExt}`;
  const fullPath = path.join(targetDir, fileName);

  await fs.writeFile(fullPath, fileBuffer);

  const relativePath = `/assets/icons/${categoryFolder}/${fileName}`;
  return { relativePath, fullPath };
}

/**
 * Safely deletes an old icon file from public/assets/icons directory.
 * Prevents path traversal and ignores ENOENT gracefully.
 */
export async function deleteOldIconFile(iconPath?: string | null): Promise<boolean> {
  if (!iconPath || typeof iconPath !== 'string') return false;

  const fullPath = resolveIconDiskPath(iconPath);
  if (!fullPath) {
    console.warn('[IconStorage] Path tidak valid untuk dihapus:', iconPath);
    return false;
  }

  try {
    // Check if file exists on disk
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    console.log(`[IconStorage] ✅ Berhasil menghapus file icon lama dari disk: ${fullPath}`);
    return true;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== 'ENOENT') {
      console.warn(`[IconStorage] Gagal menghapus file ${fullPath}:`, error.message);
    } else {
      console.log(`[IconStorage] File fisik tidak ada di disk (sudah terhapus atau tidak ditemukan): ${fullPath}`);
    }
    return false;
  }
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
 * Saves an uploaded app banner/preview image to public/assets/appImages/{category}/
 */
export async function saveAppImageFile(
  fileOrBase64: File | string,
  category: string
): Promise<string> {
  const categoryFolder = getCategoryFolder(category);
  const targetDir = path.join(process.cwd(), 'upload', 'assets', 'appImages', categoryFolder);
  await fs.mkdir(targetDir, { recursive: true });

  let fileBuffer: Buffer;
  let fileExt = '.png';

  if (typeof fileOrBase64 === 'string') {
    const match = fileOrBase64.match(/^data:([a-zA-Z0-9.+/-]+);base64,(.+)$/);
    if (!match) {
      throw new Error('Format gambar aplikasi tidak valid');
    }
    const mimeType = match[1];
    fileBuffer = Buffer.from(match[2], 'base64');
    const mimeToExt: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/svg+xml': '.svg',
      'image/gif': '.gif',
    };
    fileExt = mimeToExt[mimeType] || '.png';
  } else {
    fileExt = path.extname(fileOrBase64.name).toLowerCase() || '.png';
    const arrayBuffer = await fileOrBase64.arrayBuffer();
    fileBuffer = Buffer.from(arrayBuffer);
  }

  const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const filename = `appimg_${uniqueSuffix}${fileExt}`;
  const fullPath = path.join(targetDir, filename);

  await fs.writeFile(fullPath, fileBuffer);
  return `/assets/appImages/${categoryFolder}/${filename}`;
}

/**
 * Deletes an app banner/preview image from public/assets/appImages/
 */
export async function deleteAppImageFile(imageUrl?: string | null): Promise<boolean> {
  if (!imageUrl || typeof imageUrl !== 'string') return false;
  if (!imageUrl.startsWith('/assets/appImages/')) return false;

  try {
    const cleanRelative = imageUrl.replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), 'upload', cleanRelative);
    await fs.access(fullPath);
    await fs.unlink(fullPath);
    console.log(`[IconStorage] ✅ Berhasil menghapus gambar aplikasi dari disk: ${fullPath}`);
    return true;
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== 'ENOENT') {
      console.warn(`[IconStorage] Gagal menghapus file gambar aplikasi ${imageUrl}:`, error.message);
    }
    return false;
  }
}
