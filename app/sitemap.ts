
import type { MetadataRoute } from 'next';

import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import type { Item } from '@/lib/types';

export const revalidate = 3600;

const PAGE_LIMIT = 10;

function encodePath(path: string): string {
  return path
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

function uniqueItems(items: Item[]): Item[] {
  const map = new Map<string, Item>();

  for (const item of items) {
    if (!item.href) continue;

    if (!/^\/(donghua|watch)\//.test(item.href)) {
      continue;
    }

    map.set(item.href, item);
  }

  return [...map.values()];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
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
      lastModified: now,
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

  const year = now.getFullYear();

  const seasons: MetadataRoute.Sitemap =
    Array.from({ length: 6 }, (_, index) => ({
      url: `${SITE_URL}/season/${year - index}`,
      changeFrequency: 'weekly',
      priority: 0.5,
    }));

  const jobs = [
    api.genres(),

    ...Array.from(
      { length: PAGE_LIMIT },
      (_, index) => api.ongoing(index + 1),
    ),

    ...Array.from(
      { length: PAGE_LIMIT },
      (_, index) => api.completed(index + 1),
    ),

    ...Array.from(
      { length: PAGE_LIMIT },
      (_, index) => api.latest(index + 1),
    ),
  ];

  const results = await Promise.allSettled(jobs);

  const genresResult = results[0];

  const genrePages: MetadataRoute.Sitemap =
    genresResult.status === 'fulfilled'
      ? genresResult.value.map((genre) => ({
          url: `${SITE_URL}/genre/${encodeURIComponent(genre.slug)}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        }))
      : [];

  const items: Item[] = [];

  for (const result of results.slice(1)) {
    if (result.status !== 'fulfilled') continue;

    items.push(...result.value.items);
  }

  const contentPages: MetadataRoute.Sitemap =
    uniqueItems(items).map((item) => {
      const path = encodePath(item.href);

      const isEpisode = path.startsWith('/watch/');

      return {
        url: `${SITE_URL}${path}`,
        changeFrequency: isEpisode ? 'weekly' : 'daily',
        priority: isEpisode ? 0.6 : 0.8,
      };
    });

  const all = [
    ...staticPages,
    ...seasons,
    ...genrePages,
    ...contentPages,
  ];

  const seen = new Set<string>();

  return all.filter((item) => {
    if (seen.has(item.url)) return false;

    seen.add(item.url);
    return true;
  });
    }
