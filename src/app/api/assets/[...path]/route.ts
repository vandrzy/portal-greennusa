import { NextRequest, NextResponse } from 'next/server';
import { serveSafeAsset } from '@/lib/assetHelper';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> | { path: string[] } }
) {
  try {
    const resolvedParams = await Promise.resolve(context.params);
    if (!resolvedParams?.path || !Array.isArray(resolvedParams.path)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    return await serveSafeAsset(resolvedParams.path);
  } catch (error) {
    console.error('[GET /api/assets error]:', error);
    return NextResponse.json({ error: 'Asset Not Found' }, { status: 404 });
  }
}
