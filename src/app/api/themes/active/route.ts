import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  // API Tema dinonaktifkan sementara agar tidak menimpa background dark ambient ui-portal-baru
  return NextResponse.json(
    { data: null, message: 'Theme API is temporarily disabled' },
    { status: 200, headers: noCacheHeaders }
  );
}
