import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://donghuawatch.web.id';
  const pages = ['', '/ongoing', '/completed', '/latest', '/schedule', '/genre', '/az-list', '/premium', '/privacy', '/terms'];
  return pages.map((p) => ({
    url: base + p,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: p === '' ? 1 : 0.7,
  }));
}
