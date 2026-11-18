
import type { MetadataRoute } from 'next';
import { api } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import type { Item } from '@/lib/types';

export const revalidate = 3600;

const MAX_PAGES = 20;

async function collectPages(
  fetchPage: (page: number) => Promise<{
    items: Item[];
    page: { hasNext?: boolean };
  }>
): Promise<Item[]> {
  const all: Item[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      const result = await fetchPage(page);
      all.push(...result.items);

      if (!result.page.hasNext) break;
    } catch {
      break;
    }
  }

  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [genres, ongoing, completed, latest] =
    await Promise.allSettled([
      api.genres(),
      collectPages(api.ongoing),
      collectPages(api.completed),
      collectPages(api.latest),
    ]);

  const hubs: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/latest`,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ongoing`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/completed`,
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

  const genrePages: MetadataRoute.Sitemap =
    genres.status === 'fulfilled'
      ? genres.value.map((g) => ({
          url: `${SITE_URL}/genre/${encodeURIComponent(g.slug)}`,
          changeFrequency: 'weekly',
          priority: 0.6,
        }))
      : [];

  const collections: Item[] = [];

  for (const result of [ongoing, completed, latest]) {
    if (result.status === 'fulfilled') {
      collections.push(...result.value);
    }
  }

  const seen = new Set<string>();

  const contentPages: MetadataRoute.Sitemap = [];

  for (const item of collections) {
    if (!item.href) continue;

    if (!/^\/(donghua|watch)\//.test(item.href)) continue;

    const path = item.href
      .split('/')
      .map((segment, index) =>
        index < 2
          ? segment
          : encodeURIComponent(segment)
      )
      .join('/');

    if (seen.has(path)) continue;
    seen.add(path);

    contentPages.push({
      url: SITE_URL + path,
      changeFrequency: item.href.startsWith('/watch/')
        ? 'weekly'
        : 'daily',
      priority: item.href.startsWith('/watch/')
        ? 0.6
        : 0.8,
    });
  }

  return [
    ...hubs,
    ...genrePages,
    ...contentPages,
  ];
}
