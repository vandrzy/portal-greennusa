import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const fallbackTheme = {
    id: 'default',
    name: 'Default GreenNusa',
    bgImage: '/assets/backgroundTheme/default.png',
    modalOverlayColor: 'rgba(7, 94, 84, 0.35)',
    isActive: true,
    isDefault: true,
  };

  const noCacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    let activeTheme = await prisma.theme.findFirst({
      where: { isActive: true },
    });

    if (!activeTheme) {
      activeTheme = await prisma.theme.findFirst({
        where: { isDefault: true },
      });
    }

    return NextResponse.json(
      { theme: activeTheme || fallbackTheme },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error('Error GET /api/themes/active:', error);
    return NextResponse.json(
      { theme: fallbackTheme },
      { headers: noCacheHeaders }
    );
  }
}
