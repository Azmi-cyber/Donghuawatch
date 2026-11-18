
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import './globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import Link from 'next/link';

import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
} from '@/lib/site';

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default:
      'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
    template: '%s | DonghuaWatch',
  },

  description: SITE_DESCRIPTION,

  applicationName: SITE_NAME,

  category: 'entertainment',

  alternates: {
    canonical: '/',
  },

  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },

  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: SITE_NAME,
    title: 'DonghuaWatch - Nonton Donghua Sub Indo Terbaru',
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'DonghuaWatch',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'DonghuaWatch - Nonton Donghua Sub Indo',
    description: SITE_DESCRIPTION,
    images: ['/og-default.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? {
        google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
      }
    : undefined,
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#303034',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <Navbar />

          <main className="min-h-[calc(100vh-4rem)]">
            {children}
          </main>

          <footer className="border-t-[3px] border-black bg-surface py-6 text-center text-xs font-semibold text-muted">
            <nav
              aria-label="Navigasi footer"
              className="container-x mb-3 flex flex-wrap justify-center gap-x-4 gap-y-2"
            >
              <Link href="/">Beranda</Link>
              <Link href="/ongoing">Donghua Ongoing</Link>
              <Link href="/completed">Donghua Completed</Link>
              <Link href="/latest">Donghua Terbaru</Link>
              <Link href="/schedule">Jadwal Rilis</Link>
              <Link href="/genre">Genre Donghua</Link>
              <Link href="/az-list">Daftar A-Z</Link>
            </nav>

            <p>
              © {new Date().getFullYear()} DonghuaWatch.
              Informasi dan katalog donghua subtitle Indonesia.
            </p>

            <p className="mt-2">
              <Link href="/privacy">Kebijakan Privasi</Link>
              {' · '}
              <Link href="/terms">Syarat Layanan</Link>
            </p>
          </footer>
        </Providers>
      </body>
    </html>
  );
    }
