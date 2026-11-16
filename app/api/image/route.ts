import { NextRequest } from 'next/server';
import { BROWSER_UA } from '@/lib/upstream';
import { PLACEHOLDER_SVG } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const placeholder = () =>
  new Response(PLACEHOLDER_SVG, {
    status: 200,
    headers: { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=300' },
  });

function isBlockedHost(host: string) {
  return (
    host === 'localhost' ||
    host.endsWith('.local') ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.)/.test(host) ||
    host === '[::1]'
  );
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get('url');
  if (!raw) return placeholder();

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return placeholder();
  }
  if (!/^https?:$/.test(url.protocol) || isBlockedHost(url.hostname)) return placeholder();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(url.toString(), {
      headers: {
        'User-Agent': BROWSER_UA,
        Referer: url.origin + '/',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: ctrl.signal,
      next: { revalidate: 86400 },
    });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.startsWith('image/')) return placeholder();

    return new Response(await res.arrayBuffer(), {
      status: 200,
      headers: {
        'content-type': type,
        'cache-control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    return placeholder();
  } finally {
    clearTimeout(timer);
  }
}
