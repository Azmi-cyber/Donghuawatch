'use client';
import { useEffect, useRef, useState } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { History, LogOut } from 'lucide-react';

export const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
    <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
  </svg>
);

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const on = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', on);
    return () => document.removeEventListener('mousedown', on);
  }, [open]);

  if (status === 'loading') return <div className="skeleton h-9 w-9 rounded-full" />;

  if (!session?.user) {
    return (
      <button data-no-ad onClick={() => signIn('google', { callbackUrl: window.location.href })} className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-sm font-medium transition duration-200 hover:border-gold hover:text-gold">
        <GoogleIcon /> <span className="hidden sm:inline">Masuk</span>
      </button>
    );
  }

  const u = session.user;
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((v) => !v)} aria-label="Menu akun" className="block overflow-hidden rounded-full border border-gold/60 transition hover:shadow-glow">
        {u.image
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={u.image} alt="" referrerPolicy="no-referrer" className="h-9 w-9 object-cover" />
          : <span className="grid h-9 w-9 place-items-center bg-gold-gradient font-bold text-black">{(u.name ?? u.email ?? '?').charAt(0).toUpperCase()}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-lg border border-gold/40 bg-surface p-2 shadow-glow">
          <div className="border-b border-line px-3 py-2">
            <p className="truncate text-sm font-semibold">{u.name}</p>
            <p className="truncate text-xs text-muted">{u.email}</p>
          </div>
          <Link href="/riwayat" onClick={() => setOpen(false)} className="mt-1 flex items-center gap-2 rounded-md px-3 py-2.5 text-sm transition hover:bg-gold/10"><History size={16} className="text-gold" /> Riwayat saya</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition hover:bg-gold/10"><LogOut size={16} className="text-gold" /> Keluar</button>
        </div>
      )}
    </div>
  );
}
