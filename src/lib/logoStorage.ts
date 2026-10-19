import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

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
 * Saves an uploaded logo File into `public/assets/logo/` with a unique filename.
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

  const logoDir = path.join(process.cwd(), 'public', 'assets', 'logo');
  await fs.mkdir(logoDir, { recursive: true });

  const randomHex = crypto.randomBytes(6).toString('hex');
  const safeExt = ALLOWED_LOGO_EXTENSIONS.includes(ext) ? ext : '.png';
  const fileName = `logo_${Date.now()}_${randomHex}${safeExt}`;
  const fullPath = path.join(logoDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  await fs.writeFile(fullPath, Buffer.from(arrayBuffer));

  return `/assets/logo/${fileName}`;
}

/**
 * Deletes an old logo file from disk.
 * Safe against path traversal and preserves default template assets (logo-green.png).
 */
export async function deleteOldLogoFile(logoUrl?: string | null): Promise<void> {
  if (!logoUrl || typeof logoUrl !== 'string') return;

  try {
    let cleanPath = logoUrl;
    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
      const url = new URL(cleanPath);
      cleanPath = url.pathname;
    }

    cleanPath = decodeURIComponent(cleanPath);
    const relativeClean = cleanPath.replace(/^[\/\\]+/, '');
    const normalizedRelative = path.normalize(relativeClean);

    const expectedBaseRel = path.normalize('assets/logo');
    if (!normalizedRelative.toLowerCase().startsWith(expectedBaseRel.toLowerCase())) {
      return;
    }

    if (normalizedRelative.includes('..')) {
      return;
    }

    const fullPath = path.resolve(process.cwd(), 'public', normalizedRelative);
    const logoBaseDir = path.resolve(process.cwd(), 'public', 'assets', 'logo');

    if (!fullPath.toLowerCase().startsWith(logoBaseDir.toLowerCase())) {
      console.warn('[LogoStorage] Attempted delete outside logo directory:', fullPath);
      return;
    }

    const fileName = path.basename(fullPath).toLowerCase();
    // NEVER delete the default system assets
    if (fileName === 'logo-green.png' || fileName === 'logo green.png' || fileName.startsWith('default')) {
      return;
    }

    await fs.unlink(fullPath);
  } catch (err: unknown) {
    // Ignore if file doesn't exist (ENOENT)
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: string }).code === 'ENOENT') {
      return;
    }
    console.warn('[LogoStorage] Could not delete old logo file:', err);
  }
}
