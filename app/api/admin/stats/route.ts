import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isAdminEmail } from '@/lib/premiumStore';
import { getStats } from '@/lib/visitorStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const s = await getServerSession(authOptions);
  if (!isAdminEmail(s?.user?.email)) return NextResponse.json({ message: 'Akses ditolak.' }, { status: 403 });
  try {
    return NextResponse.json(await getStats(), { headers: { 'cache-control': 'no-store' } });
  } catch {
    return NextResponse.json({ message: 'Statistik tidak dapat dibaca.' }, { status: 502 });
  }
}
