'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowDownAZ, CalendarDays, Crown, History, Home, Tags, Tv, X } from 'lucide-react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import Logo from './Logo';
import { GoogleIcon } from './UserMenu';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/', label: 'Home', icon: Home, match: ['/'] },
  { href: '/ongoing', label: 'Donghua', icon: Tv, match: ['/ongoing', '/completed', '/latest', '/donghua', '/watch', '/season'] },
  { href: '/schedule', label: 'Schedule', icon: CalendarDays, match: ['/schedule'] },
  { href: '/riwayat', label: 'Riwayat', icon: History, match: ['/riwayat'] },
  { href: '/genre', label: 'Genre', icon: Tags, match: ['/genre'] },
  { href: '/az-list', label: 'A-Z List', icon: ArrowDownAZ, match: ['/az-list'] },
  { href: '/premium', label: 'Premium', icon: Crown, match: ['/premium'] },
];

export default function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  useEffect(() => { onClose(); /* tutup saat navigasi */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  const isActive = (m: string[]) => m.some((x) => (x === '/' ? pathname === '/' : pathname.startsWith(x)));

  return (
    <div className={cn('fixed inset-0 z-[60]', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div
        onClick={onClose}
        className={cn('absolute inset-0 bg-black/60 transition-opacity duration-300', open ? 'opacity-100' : 'opacity-0')}
      />
      <aside
        role="dialog"
        aria-label="Menu navigasi"
        className={cn(
          'absolute left-0 top-0 flex h-full w-[280px] flex-col border-r-[3px] border-black bg-surface shadow-brutal-lg transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo />
          <button onClick={onClose} aria-label="Tutup menu" className="rounded-md p-2 text-muted transition hover:bg-gold/10 hover:text-gold">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ITEMS.map(({ href, label, icon: Icon, match }) => {
            const active = isActive(match);
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition duration-200',
                  active ? 'bg-gold/15 text-gold' : 'text-ink hover:bg-gold/10',
                )}
              >
                <Icon size={19} className="text-gold" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          {session?.user ? (
            <button onClick={() => signOut({ callbackUrl: '/' })} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left text-sm font-medium transition hover:bg-gold/10">
              <LogOut size={19} className="text-gold" />
              <span className="min-w-0"><span className="block truncate">Keluar</span><span className="block truncate text-xs font-normal text-muted">{session.user.email}</span></span>
            </button>
          ) : (
            <button data-no-ad onClick={() => signIn('google', { callbackUrl: window.location.href })} className="flex w-full items-center gap-3 rounded-md border border-line px-3 py-3 text-sm font-medium transition hover:border-gold hover:bg-gold/10">
              <GoogleIcon /> Masuk dengan Google
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
