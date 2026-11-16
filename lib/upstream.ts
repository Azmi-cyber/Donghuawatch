// Dipakai di sisi server saja (route proxy + generateMetadata).
export const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'https://www.sankavollerei.web.id/anime').replace(/\/+$/, '');

export const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export const upstreamHeaders = (referer?: string): HeadersInit => ({
  'User-Agent': BROWSER_UA,
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
  Referer: referer ?? new URL(API_BASE).origin + '/',
});

export async function upstreamJson(path: string, timeoutMs = 8000): Promise<unknown> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${API_BASE}/${path.replace(/^\/+/, '')}`, {
      headers: upstreamHeaders(),
      signal: ctrl.signal,
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}
