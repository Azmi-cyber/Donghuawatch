
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/premiumStore';
import { getStats } from '@/lib/visitorStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    // Periksa sesi login.
    const session = await getServerSession(authOptions);

    // Periksa hak akses admin.
    if (!isAdminEmail(session?.user?.email)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak. Akun bukan admin.',
        },
        { status: 403 }
      );
    }

    // Ambil statistik dari database.
    const stats = await getStats();

    return NextResponse.json(
      {
        success: true,
        ...stats,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('[ADMIN STATS GET ERROR]', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Gagal mengambil statistik pengunjung.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
