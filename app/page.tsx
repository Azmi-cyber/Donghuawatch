
import type { Metadata } from 'next';

import HomeView from '@/components/HomeView';
import JsonLd from '@/components/JsonLd';

import { getGenres, getHome } from '@/lib/server';

import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
} from '@/lib/site';

export const revalidate = 180;

export const metadata: Metadata = {
  title: {
    absolute:
      'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
  },

  description: SITE_DESCRIPTION,

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    title: 'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
    description: SITE_DESCRIPTION,
    url: '/',
    siteName: SITE_NAME,
    locale: 'id_ID',
    images: ['/og-default.png'],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
    description: SITE_DESCRIPTION,
    images: ['/og-default.png'],
  },
};

export default async function HomePage() {
  const [home, genres] = await Promise.all([
    getHome(),
    getGenres(),
  ]);

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      alternateName: 'Donghua Watch',
      url: SITE_URL,
      inLanguage: 'id-ID',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  ];

  return (
    <>
      <JsonLd data={structuredData} />

      <HomeView
        initialHome={home}
        initialGenres={genres}
      />
    </>
  );
}
