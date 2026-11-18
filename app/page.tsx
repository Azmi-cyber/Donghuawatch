
import type { Metadata } from 'next';
import HomeView from '@/components/HomeView';
import JsonLd from '@/components/JsonLd';

import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
} from '@/lib/site';

export const revalidate = 180;

export const metadata: Metadata = {
  title: {
    absolute: 'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
  },

  description: SITE_DESCRIPTION,

  alternates: {
    canonical: '/',
  },

  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: SITE_NAME,
    title: 'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: ['/og-default.png'],
  },
};

const structuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
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

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <HomeView />
    </>
  );
}
