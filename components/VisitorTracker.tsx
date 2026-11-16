'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PING_EVERY_MS = 4.5 * 60 * 1000; // satu laporan per ~5 menit per pengunjung (hemat kuota database)

function visitorId(): string {
  try {
    let v = localStorage.getItem('dw:vid');
    if (!v) {
      v = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('dw:vid', v);
    }
    return v;
  } catch { return ''; }
}

/** Melaporkan kunjungan anonim (ID acak) untuk statistik di panel admin. */
export default function VisitorTracker() {
  const pathname = usePathname() ?? '';
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const send = () => {
      const vid = visitorId();
      if (!vid) return;
      try {
        const last = Number(localStorage.getItem('dw:lastping')) || 0;
        if (Date.now() - last < PING_EVERY_MS) return;
        localStorage.setItem('dw:lastping', String(Date.now()));
      } catch {}
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ vid, path: pathname }), keepalive: true }).catch(() => {});
    };
    send();
    const id = setInterval(() => { if (document.visibilityState === 'visible') send(); }, PING_EVERY_MS);
    return () => clearInterval(id);
  }, [pathname]);
  return null;
}
