import path from 'path';
import fs from 'fs/promises';
import { NextResponse } from 'next/server';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'upload', 'assets');

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.svg': 'image/svg+xml',
};

export async function serveSafeAsset(input: string[] | string) {
  try {
    // 1. Bersihkan dan normalisasi segmen path
    const rawSegments = Array.isArray(input)
      ? input
      : input.replace(/^\/?assets\/?/, '').split('/').filter(Boolean);

    const sanitizedSegments = rawSegments.map((seg) => decodeURIComponent(seg));
    const targetPath = path.resolve(UPLOAD_ROOT, ...sanitizedSegments);

    // 2. Proteksi Path Traversal: Pastikan targetPath berada di dalam UPLOAD_ROOT
    if (!targetPath.startsWith(UPLOAD_ROOT + path.sep)) {
      return NextResponse.json({ error: 'Forbidden path' }, { status: 403 });
    }

    // 3. Validasi ekstensi file yang diizinkan
    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext];
    if (!contentType) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // 4. Baca file & stat untuk ETag / Caching
    const stat = await fs.stat(targetPath);
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const fileBuffer = await fs.readFile(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    console.error('[serveSafeAsset Error]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
