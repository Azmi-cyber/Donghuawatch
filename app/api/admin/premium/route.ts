import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { isEmail, normEmail, PLANS } from '@/lib/premium';
import { addPremium, isAdminEmail, listPremium, removePremium } from '@/lib/premiumStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const json = (b: unknown, status = 200) => NextResponse.json(b, { status, headers: { 'cache-control': 'no-store' } });

async function guard(): Promise<boolean> {
  const s = await getServerSession(authOptions);
  return isAdminEmail(s?.user?.email);
}

export async function GET() {
  if (!(await guard())) return json({ message: 'Akses ditolak.' }, 403);
  try { return json({ rows: await listPremium() }); } catch { return json({ message: 'Database tidak dapat dibaca.' }, 502); }
}

export async function POST(req: NextRequest) {
  if (!(req.headers.get('content-type') ?? '').includes('application/json')) return json({ message: 'Format tidak valid.' }, 415);
  if (!(await guard())) return json({ message: 'Akses ditolak.' }, 403);
  let body: { email?: string; plan?: string };
  try { body = await req.json(); } catch { return json({ message: 'Format tidak valid.' }, 400); }
  const email = String(body.email ?? '').trim();
  const plan = PLANS.find((p) => p.id === body.plan);
  if (!isEmail(email)) return json({ message: 'Email tidak valid.' }, 400);
  if (!plan) return json({ message: 'Paket tidak valid.' }, 400);
  try {
    const until = await addPremium(email, plan.days);
    return json({ email: normEmail(email), until });
  } catch { return json({ message: 'Gagal menyimpan.' }, 502); }
}

export async function DELETE(req: NextRequest) {
  if (!(await guard())) return json({ message: 'Akses ditolak.' }, 403);
  const email = req.nextUrl.searchParams.get('email') ?? '';
  if (!isEmail(email)) return json({ message: 'Email tidak valid.' }, 400);
  try { await removePremium(email); return json({ ok: true }); } catch { return json({ message: 'Gagal menghapus.' }, 502); }
}
