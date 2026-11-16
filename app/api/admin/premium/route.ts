
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { isEmail, normEmail, PLANS } from '@/lib/premium';
import {
  addPremium,
  isAdminEmail,
  listPremium,
  removePremium,
} from '@/lib/premiumStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const json = (data: unknown, status = 200) => {
  return NextResponse.json(data, {
    status,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
};

// Memeriksa apakah pengguna sudah login dan merupakan admin.
async function checkAdmin(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  return isAdminEmail(session?.user?.email);
}

// GET: mengambil seluruh daftar akun Premium.
export async function GET() {
  try {
    const allowed = await checkAdmin();

    if (!allowed) {
      return json(
        { success: false, message: 'Akses ditolak. Login sebagai admin.' },
        403
      );
    }

    const rows = await listPremium();

    return json({
      success: true,
      rows,
    });
  } catch (error) {
    console.error('[ADMIN PREMIUM GET ERROR]', error);

    return json(
      {
        success: false,
        message: 'Gagal memuat data Premium. Periksa autentikasi dan Redis.',
      },
      500
    );
  }
}

// POST: menambahkan akun Premium.
export async function POST(req: NextRequest) {
  try {
    const allowed = await checkAdmin();

    if (!allowed) {
      return json(
        { success: false, message: 'Akses ditolak.' },
        403
      );
    }

    const contentType = req.headers.get('content-type') ?? '';

    if (!contentType.includes('application/json')) {
      return json(
        { success: false, message: 'Content-Type harus application/json.' },
        415
      );
    }

    const body = await req.json();

    const email = String(body.email ?? '').trim();
    const plan = PLANS.find((p) => p.id === body.plan);

    if (!isEmail(email)) {
      return json(
        { success: false, message: 'Email tidak valid.' },
        400
      );
    }

    if (!plan) {
      return json(
        { success: false, message: 'Paket Premium tidak valid.' },
        400
      );
    }

    const until = await addPremium(email, plan.days);

    return json({
      success: true,
      message: 'Premium berhasil ditambahkan.',
      email: normEmail(email),
      until,
    });
  } catch (error) {
    console.error('[ADMIN PREMIUM POST ERROR]', error);

    return json(
      {
        success: false,
        message: 'Gagal menambahkan Premium. Periksa konfigurasi server.',
      },
      500
    );
  }
}

// DELETE: mencabut akun Premium.
export async function DELETE(req: NextRequest) {
  try {
    const allowed = await checkAdmin();

    if (!allowed) {
      return json(
        { success: false, message: 'Akses ditolak.' },
        403
      );
    }

    const email = req.nextUrl.searchParams.get('email') ?? '';

    if (!isEmail(email)) {
      return json(
        { success: false, message: 'Email tidak valid.' },
        400
      );
    }

    await removePremium(email);

    return json({
      success: true,
      message: 'Premium berhasil dicabut.',
    });
  } catch (error) {
    console.error('[ADMIN PREMIUM DELETE ERROR]', error);

    return json(
      {
        success: false,
        message: 'Gagal mencabut Premium.',
      },
      500
    );
  }
                             }
      
