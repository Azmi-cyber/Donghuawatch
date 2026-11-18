
import { imageUrl } from './utils';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://www.donghuawatch.web.id'
).replace(/\/+$/, '');

export const SITE_NAME = 'DonghuaWatch';

export const SITE_DESCRIPTION =
  'Temukan donghua terbaru subtitle Indonesia, episode ongoing, donghua completed, jadwal rilis, sinopsis, dan informasi serial animasi China di DonghuaWatch.';

export const abs = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export function plain(value: string): string {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clip(value: string, max = 160): string {
  const text = plain(value);

  if (text.length <= max) return text;

  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');

  return (
    (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut)
      .replace(/[\s,.;:–-]+$/, '') + '…'
  );
}

export function posterPath(original?: string | null) {
  if (!original) return undefined;

  try {
    const result = imageUrl(original);
    return result.startsWith('/api/image') ? result : undefined;
  } catch {
    return undefined;
  }
}

export function episodeNumber(title: string) {
  const match = /(?:episode|eps?)\s*(\d+)/i.exec(title);
  return match ? Number(match[1]) : undefined;
}

export function subIndoTitle(title: string) {
  const text = plain(title);

  return /sub(title)?\s*indo/i.test(text)
    ? text
    : `${text} Subtitle Indonesia`;
}

export const encSlug = (slug: string) => {
  try {
    return encodeURIComponent(decodeURIComponent(slug));
  } catch {
    return encodeURIComponent(slug);
  }
};
    
