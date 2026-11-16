import { NextRequest, NextResponse } from 'next/server';
import { recordVisit } from '@/lib/visitorStore';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BOT = /bot|crawl|spider|slurp|bing|facebookexternalhit|headless|lighthouse|monitor|preview/i;
const empty = () => new NextResponse(null, { status: 204 });

export async function POST(req: NextRequest) {
  if (BOT.test(req.headers.get('user-agent') ?? '')) return empty();
  let body: { vid?: string; path?: string };
  try { body = await req.json(); } catch { return empty(); }
  const vid = String(body.vid ?? '');
  const path = String(body.path ?? '');
  if (!/^[a-zA-Z0-9-]{8,64}$/.test(vid) || path.startsWith('/admin')) return empty();
  try { await recordVisit(vid); } catch {}
  return empty();
}
