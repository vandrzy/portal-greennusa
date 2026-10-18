import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const iconPath = searchParams.get('path');

    if (!iconPath || !iconPath.startsWith('/assets/')) {
      return NextResponse.json(
        { error: 'Path gambar tidak valid' },
        { status: 400 }
      );
    }

    // Mencegah directory traversal attack
    const safeRelativePath = path.normalize(iconPath).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullFilePath = path.join(process.cwd(), 'public', safeRelativePath);

    const fileBuffer = await fs.readFile(fullFilePath);
    const ext = path.extname(fullFilePath).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Gagal memuat gambar via API:', error);
    return NextResponse.json(
      { error: 'File gambar tidak ditemukan' },
      { status: 404 }
    );
  }
}
