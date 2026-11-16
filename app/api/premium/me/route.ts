import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPremiumUntil, isAdminEmail } from '@/lib/premiumStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const s = await getServerSession(authOptions);
  const email = s?.user?.email;
  const out = (b: object) => NextResponse.json(b, { headers: { 'cache-control': 'no-store' } });
  if (!email) return out({ premium: false, until: 0, admin: false });
  try {
    const until = await getPremiumUntil(email);
    return out({ premium: until > Date.now(), until, admin: isAdminEmail(email) });
  } catch {
    return out({ premium: false, until: 0, admin: isAdminEmail(email) });
  }
}
