
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { usePremium } from '@/lib/usePremium';

// ===== PENGATURAN IKLAN =====

const CLICK_AD_URL =
  'https://araplhn.org/4/21dd3f9576ba0a05b7b4e29258b73b11';

// Cooldown 15 detik
const CLICK_INTERVAL_MS = 15 * 1000;

// Elemen yang tidak memicu iklan
const IGNORE = [
  '[data-no-ad]',
  'input',
  'textarea',
  'select',
  '[role="dialog"]',
  'a[target="_blank"]',
].join(', ');

// Halaman tanpa iklan
const NO_AD_PATHS = ['/premium', '/admin'];

// ============================

export default function AdScripts() {
  const { ready, premium } = usePremium();
  const pathname = usePathname() ?? '';

  const show = ready && !premium;

  const blocked = NO_AD_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  useEffect(() => {
    if (!show || blocked) return;

    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;

      // Abaikan elemen tertentu
      if (target?.closest?.(IGNORE)) return;

      // Jangan memicu iklan dari klik kanan
      if (event.button !== 0) return;

      try {
        const now = Date.now();

        const last = Number(
          localStorage.getItem('dw:ad-last-click') || 0
        );

        // Masih dalam cooldown
        if (now - last < CLICK_INTERVAL_MS) {
          return;
        }

        // Simpan waktu pemicu iklan
        localStorage.setItem(
          'dw:ad-last-click',
          String(now)
        );

        // Buka iklan
        window.open(
          CLICK_AD_URL,
          '_blank',
          'noopener,noreferrer'
        );

      } catch (error) {
        console.error('[DonghuaWatch Ads]', error);
      }
    };

    document.addEventListener('click', onClick, true);

    return () => {
      document.removeEventListener('click', onClick, true);
    };
  }, [show, blocked]);

  if (!show || blocked) return null;

  return (
    <>
      <Script
        id="ads-abscloud"
        src="https://abscloud.org/1/91f823fa9b82992fc85cf82de624c104"
        strategy="afterInteractive"
        data-cfasync="false"
      />

      <Script
        id="ads-bauval-14"
        src="https://bauval.org/14/4aa12f1a5af8bba91aaba5ab14574212"
        strategy="afterInteractive"
        data-cfasync="false"
      />
    </>
  );
}
