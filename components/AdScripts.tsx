'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { usePremium } from '@/lib/usePremium';

// ====== PENGATURAN IKLAN ======
const CLICK_AD_URL = 'https://araplhn.org/4/21dd3f9576ba0a05b7b4e29258b73b11';
// Dibuat nyaman: link TIDAK dibuka di setiap klik.
const SKIP_FIRST_CLICKS = 4;               // 4 klik pertama di tiap kunjungan dibiarkan (pengunjung bebas menjelajah)
const CLICK_INTERVAL_MS = 30 * 60 * 1000;  // jeda minimal antar kemunculan (30 menit)
const MAX_PER_DAY = 2;                     // maksimal kemunculan per pengunjung per hari
// Klik pada elemen ini tidak pernah memicu iklan (form, popup/modal, link keluar):
const IGNORE = '[data-no-ad], input, textarea, select, [role="dialog"], a[target="_blank"]';
const NO_AD_PATHS = ['/premium', '/admin'];
// ==============================

/** Iklan hanya dimuat setelah status premium diketahui; akun premium tidak melihat iklan sama sekali. */
export default function AdScripts() {
  const { ready, premium } = usePremium();
  const pathname = usePathname() ?? '';
  const show = ready && !premium;
  const blocked = NO_AD_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!show || blocked) return;
    let clicks = 0;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.(IGNORE)) return;
      if (++clicks <= SKIP_FIRST_CLICKS) return;
      try {
        const today = new Date().toISOString().slice(0, 10);
        const st = JSON.parse(localStorage.getItem('dw:adclick') || '{}');
        const n = st.day === today ? Number(st.n) || 0 : 0;
        const last = Number(st.last) || 0;
        if (n >= MAX_PER_DAY) return;
        if (CLICK_INTERVAL_MS > 0 && Date.now() - last < CLICK_INTERVAL_MS) return;
        localStorage.setItem('dw:adclick', JSON.stringify({ day: today, n: n + 1, last: Date.now() }));
      } catch { return; } // storage tidak tersedia → jangan buka (hindari spam)
      window.open(CLICK_AD_URL, '_blank', 'noopener');
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [show, blocked]);

  if (!show || blocked) return null;
  return (
    <>
      <Script id="ads-abscloud" src="https://abscloud.org/1/91f823fa9b82992fc85cf82de624c104" strategy="afterInteractive" data-cfasync="false" />
      <Script id="ads-bauval-14" src="https://bauval.org/14/4aa12f1a5af8bba91aaba5ab14574212" strategy="afterInteractive" data-cfasync="false" />
    </>
  );
}
