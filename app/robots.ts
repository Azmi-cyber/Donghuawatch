
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/api/image',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/debug/',
          '/riwayat/',
          '/search/',
          '/premium/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/debug/',
          '/riwayat/',
          '/search/',
          '/premium/',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: [
          '/api/image',
          '/og-default.png',
          '/logo.png',
        ],
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
