import { NextRequest, NextResponse } from 'next/server';
import { API_BASE, upstreamHeaders } from '@/lib/upstream';

export const dynamic = 'force-dynamic';

const err = (status: number, error: string, message: string) =>
  NextResponse.json({ error, message }, { status });

export async function GET(req: NextRequest) {
  // Pakai pathname mentah supaya encoding (mis. %23, spasi) tidak berubah.
  const path = req.nextUrl.pathname.replace(/^\/api\/proxy\/?/, '');
  if (!path || path.includes('..')) return err(400, 'bad_request', 'Path tidak valid.');

  const target = `${API_BASE}/${path}${req.nextUrl.search}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);

  try {
    const res = await fetch(target, {
      headers: upstreamHeaders(),
      signal: ctrl.signal,
      next: { revalidate: 60 },
    });
    if (res.status === 404) return err(404, 'not_found', 'Data tidak ditemukan.');
    if (!res.ok) return err(502, 'bad_gateway', `Server sumber mengembalikan status ${res.status}.`);

    const body = await res.text();
    return new NextResponse(body, {
      status: 200,
      headers: {
        'content-type': res.headers.get('content-type') ?? 'application/json; charset=utf-8',
        'cache-control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    return aborted
      ? err(504, 'gateway_timeout', 'Server sumber tidak merespons dalam 15 detik.')
      : err(502, 'bad_gateway', 'Tidak dapat menghubungi server sumber.');
  } finally {
    clearTimeout(timer);
  }
}
