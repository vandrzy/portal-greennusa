import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';

export const UPLOAD_ROOT = path.resolve(process.cwd(), 'upload', 'assets');

export interface SaveUploadOptions {
  subFolder: string;          // contoh: 'logo', 'backgroundTheme', 'icons/pemerintahan'
  filePrefix: string;         // contoh: 'logo', 'theme', 'appimg', 'icon'
  maxSizeBytes?: number;      // default 5MB
}

/**
 * Validasi Magic Bytes untuk memastikan file benar-benar gambar asli (PNG, JPEG, WEBP, GIF, SVG)
 */
export function detectImageExtension(buffer: Buffer): '.png' | '.jpg' | '.webp' | '.gif' | '.svg' | null {
  if (buffer.length < 4) return null;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return '.png';
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return '.jpg';
  }

  // GIF: "GIF87a" or "GIF89a"
  if (buffer.length >= 6 && buffer.toString('ascii', 0, 3) === 'GIF') {
    return '.gif';
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return '.webp';
  }

  // SVG: Format berbasis teks XML/SVG
  const textHeader = buffer.toString('utf-8', 0, Math.min(buffer.length, 512)).trim().toLowerCase();
  if (textHeader.includes('<svg') || (textHeader.includes('<?xml') && textHeader.includes('<svg'))) {
    return '.svg';
  }

  return null;
}

/**
 * Menyimpan file gambar tervalidasi dengan Magic Bytes & batasan ukuran
 */
export async function saveValidatedImage(
  fileOrBuffer: File | Blob | Buffer,
  options: SaveUploadOptions
): Promise<{ fileName: string; relativePath: string; fullPath: string }> {
  let buffer: Buffer;
  let byteLength: number;

  if (Buffer.isBuffer(fileOrBuffer)) {
    buffer = fileOrBuffer;
    byteLength = buffer.length;
  } else {
    byteLength = fileOrBuffer.size;
    const arrayBuffer = await fileOrBuffer.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  const maxBytes = options.maxSizeBytes ?? 5 * 1024 * 1024;
  if (byteLength > maxBytes) {
    throw new Error(`Ukuran file melebihi batas maksimal (${Math.round(maxBytes / 1024 / 1024)}MB)`);
  }

  if (byteLength <= 0) {
    throw new Error('File tidak boleh kosong');
  }

  const ext = detectImageExtension(buffer);
  if (!ext) {
    throw new Error('Format file tidak valid. Hanya mendukung gambar PNG, JPG, WEBP, SVG, atau GIF asli.');
  }

  const normalizedSubFolder = options.subFolder.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  const targetDir = path.resolve(UPLOAD_ROOT, ...normalizedSubFolder.split('/'));

  if (!targetDir.toLowerCase().startsWith(UPLOAD_ROOT.toLowerCase())) {
    throw new Error('Invalid target directory: Akses di luar UPLOAD_ROOT ditolak');
  }

  await fs.mkdir(targetDir, { recursive: true });

  const randomHex = crypto.randomBytes(4).toString('hex');
  const fileName = `${options.filePrefix}_${Date.now()}_${randomHex}${ext}`;
  const fullPath = path.join(targetDir, fileName);

  await fs.writeFile(fullPath, buffer);

  const relativePath = path.posix.join('/assets', normalizedSubFolder, fileName);
  return { fileName, relativePath, fullPath };
}

/**
 * Menghapus file aset lama secara aman (terlindungi dari Path Traversal dan aset default terlindungi)
 */
export async function deleteAssetSafely(
  relativeAssetPath?: string | null,
  protectedFileNames: string[] = ['default.png', 'logo-green.png', 'logo green.png']
): Promise<boolean> {
  if (!relativeAssetPath || typeof relativeAssetPath !== 'string') return false;

  let cleanPath = relativeAssetPath;
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const url = new URL(cleanPath);
      cleanPath = url.pathname;
    } catch {
      // Abaikan jika bukan URL valid
    }
  }

  if (cleanPath.startsWith('/api/icon?path=')) {
    try {
      const url = new URL(`http://localhost${cleanPath}`);
      cleanPath = url.searchParams.get('path') || cleanPath;
    } catch {
      // Abaikan jika bukan query valid
    }
  }

  cleanPath = decodeURIComponent(cleanPath);
  const baseName = path.basename(cleanPath).toLowerCase();

  // Lindungi file bawaan sistem agar tidak terhapus
  if (protectedFileNames.some((p) => p.toLowerCase() === baseName || baseName.startsWith('default'))) {
    return false;
  }

  // Buang prefix /assets/ atau /
  const stripped = cleanPath.replace(/^[\/\\]*(assets[\/\\])?/, '');
  const targetPath = path.resolve(UPLOAD_ROOT, stripped);

  if (!targetPath.toLowerCase().startsWith(UPLOAD_ROOT.toLowerCase() + path.sep)) {
    console.warn('[deleteAssetSafely] Percobaan path traversal saat menghapus file:', targetPath);
    return false;
  }

  try {
    await fs.access(targetPath);
    await fs.unlink(targetPath);
    return true;
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      console.warn('[deleteAssetSafely] Gagal menghapus file:', targetPath, err?.message);
    }
    return false;
  }
}
