import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import Providers from '@/components/Providers';

const heading = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const body = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'DonghuaWatch - Nonton Donghua Sub Indo', template: '%s | DonghuaWatch' },
  description: 'Streaming dan download donghua terbaru subtitle Indonesia: ongoing, completed, jadwal rilis, dan genre lengkap.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
};
export const viewport: Viewport = { themeColor: '#303034' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <footer className="border-t-[3px] border-black bg-surface py-6 text-center text-xs font-semibold text-muted">
            © {new Date().getFullYear()} DonghuaWatch. Semua konten milik pemegang hak ciptanya masing-masing.
            <div className="mt-2 flex justify-center gap-4">
              <Link href="/privacy" className="underline hover:text-gold">Kebijakan Privasi</Link>
              <Link href="/terms" className="underline hover:text-gold">Syarat Layanan</Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
