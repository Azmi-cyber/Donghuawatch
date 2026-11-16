export const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

export const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="#1a1b1e"/><rect x="12" y="12" width="276" height="376" rx="10" fill="none" stroke="#2a2b30" stroke-width="2"/><path d="M122 165l70 35-70 35z" fill="none" stroke="#d4af37" stroke-width="6" stroke-linejoin="round"/><text x="150" y="290" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#9a9ba0">Poster tidak tersedia</text></svg>`;
export const PLACEHOLDER_URI = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

/** Semua poster WAJIB lewat helper ini agar melewati image proxy. */
export function imageUrl(originalUrl?: string | null): string {
  if (!originalUrl) return PLACEHOLDER_URI;
  let u = originalUrl.trim();
  if (u.startsWith('//')) u = 'https:' + u;
  if (!/^https?:\/\//i.test(u)) return PLACEHOLDER_URI;
  return `/api/image?url=${encodeURIComponent(u)}`;
}

export function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export function humanize(slug: string): string {
  return decodeURIComponent(slug).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return 'baru saja';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} hari lalu`;
  return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}
