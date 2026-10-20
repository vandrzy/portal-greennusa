import { NextRequest, NextResponse } from 'next/server';
import { serveSafeAsset } from '@/lib/assetHelper';

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

    return await serveSafeAsset(iconPath);
  } catch (error) {
    console.error('Gagal memuat gambar via API:', error);
    return NextResponse.json(
      { error: 'File gambar tidak ditemukan' },
      { status: 404 }
    );
  }
}
