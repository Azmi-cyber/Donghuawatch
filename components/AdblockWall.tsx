'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Crown, Loader2, LogIn, ShieldAlert } from 'lucide-react';
import { usePremium } from '@/lib/usePremium';
import { PLANS, rupiah } from '@/lib/premium';

// ====== PENGATURAN ======
const PROBE_URL = 'https://abscloud.org/1/91f823fa9b82992fc85cf82de624c104'; // domain iklan untuk uji
const EXEMPT_PATHS = ['/premium', '/privacy', '/terms', '/admin']; // tetap bisa dibuka saat adblock aktif
// ========================

async function detectAdblock(): Promise<boolean> {
  // 1) Elemen umpan: filter adblock menyembunyikan class bernama "iklan".
  const bait = document.createElement('div');
  bait.className = 'adsbox ad-banner ads advert pub_300x250';
  bait.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:10px;height:10px;';
  bait.innerHTML = '&nbsp;';
  document.body.appendChild(bait);
  await new Promise((r) => setTimeout(r, 120));
  const cs = getComputedStyle(bait);
  const hidden = !bait.offsetHeight || cs.display === 'none' || cs.visibility === 'hidden';
  bait.remove();
  if (hidden) return true;
  // 2) Request ke domain iklan: diblokir ekstensi → fetch gagal (bukan karena offline).
  try {
    await fetch(PROBE_URL, { method: 'HEAD', mode: 'no-cors', cache: 'no-store' });
    return false;
  } catch {
    return navigator.onLine;
  }
}

/** Menutup situs selama adblock aktif. Satu-satunya jalan: matikan adblock atau pakai akun Premium. */
export default function AdblockWall() {
  const { ready, premium } = usePremium();
  const pathname = usePathname() ?? '';
  const active = ready && !premium && !EXEMPT_PATHS.some((p) => pathname.startsWith(p));
  const [blocked, setBlocked] = useState(false);
  const [checking, setChecking] = useState(false);
  const cheapest = rupiah(Math.min(...PLANS.map((p) => p.price)));

  const run = useCallback(async () => {
    setBlocked(await detectAdblock());
  }, []);

  const recheck = async () => {
    setChecking(true);
    try { await run(); } finally { setChecking(false); }
  };

  // Cek saat masuk, lalu tiap 15 detik (layar hilang sendiri kalau adblock dimatikan).
  useEffect(() => {
    if (!active) { setBlocked(false); return; }
    void run();
    const id = setInterval(() => void run(), 15000);
    return () => clearInterval(id);
  }, [active, run]);

  useEffect(() => {
    if (!(active && blocked)) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active, blocked]);

  if (!active || !blocked) return null;
  return (
    <div data-no-ad className="fixed inset-0 z-[200] grid place-items-center overflow-y-auto bg-black/90 p-4" role="alertdialog" aria-modal="true" aria-labelledby="adb-title">
      <div className="card-brutal w-full max-w-md p-6 text-center shadow-brutal-gold">
        <ShieldAlert size={42} className="mx-auto text-gold" />
        <h2 id="adb-title" className="mt-3 font-heading text-xl font-extrabold">Adblocker terdeteksi</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          DonghuaWatch gratis karena ada iklan. Dukung kami dengan mematikan adblock untuk situs ini, atau pakai akun Premium agar nonton tanpa iklan.
        </p>

        <div className="mt-5 grid gap-3 text-left">
          <Link href="/premium" className="btn-primary !justify-between !py-3">
            <span className="flex items-center gap-2"><Crown size={18} /> Premium tanpa iklan</span>
            <span className="rounded border-2 border-black bg-bg px-2 py-0.5 text-xs text-gold">mulai {cheapest}</span>
          </Link>
          <button onClick={() => void recheck()} disabled={checking} className="btn-secondary !justify-start !py-3">
            {checking ? <Loader2 size={18} className="shrink-0 animate-spin" /> : <ShieldAlert size={18} className="shrink-0" />}
            <span>Saya sudah mematikan adblock<span className="block text-xs font-medium opacity-70">cek ulang sekarang</span></span>
          </button>
        </div>

        <button onClick={() => signIn('google', { callbackUrl: window.location.href })} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-muted underline hover:text-gold">
          <LogIn size={14} /> Sudah Premium? Login
        </button>
      </div>
    </div>
  );
}
