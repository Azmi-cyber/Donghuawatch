
import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

export const revalidate = 3600;

const PAGE_LIMIT = 10;

function normalizePath(href: string): string | null {
  if (!href.startsWith('/')) return null;

  if (!/^\/(donghua|watch)\//.test(href)) {
    return null;
  }

  return href
    .split('/')
    .map((segment, index) => {
      if (index < 2 || !segment) return segment;

      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join('/');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/latest`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ongoing`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/completed`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/schedule`,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/genre`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/az-list`,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  const [genresResult, ongoingResults, completedResults, latestResults] =
    await Promise.all([
      api.genres().catch(() => []),
      Promise.all(
        Array.from(
          { length: PAGE_LIMIT },
          (_, i) => api.ongoing(i + 1).catch(() => null)
        )
      ),
      Promise.all(
        Array.from(
          { length: PAGE_LIMIT },
          (_, i) => api.completed(i + 1).catch(() => null)
        )
      ),
      Promise.all(
        Array.from(
          { length: PAGE_LIMIT },
          (_, i) => api.latest(i + 1).catch(() => null)
        )
      ),
    ]);

  const genrePages: MetadataRoute.Sitemap = genresResult.map(
    (genre) => ({
      url: `${SITE_URL}/genre/${encodeURIComponent(genre.slug)}`,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  );

  const allResults = [
    ...ongoingResults,
    ...completedResults,
    ...latestResults,
  ];

  const seen = new Set<string>();

  const contentPages: MetadataRoute.Sitemap = [];

  for (const result of allResults) {
    if (!result) continue;

    for (const item of result.items) {
      if (!item.href) continue;

      const path = normalizePath(item.href);

      if (!path || seen.has(path)) continue;

      seen.add(path);

      const isEpisode = path.startsWith('/watch/');

      contentPages.push({
        url: `${SITE_URL}${path}`,
        changeFrequency: isEpisode ? 'weekly' : 'daily',
        priority: isEpisode ? 0.6 : 0.8,
      });
    }
  }

  const allPages = [
    ...staticPages,
    ...genrePages,
    ...contentPages,
  ];

  const unique = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const page of allPages) {
    unique.set(page.url, page);
  }

  return [...unique.values()];
    }
    
