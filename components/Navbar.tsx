'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Menu, Search } from 'lucide-react';
import Logo from './Logo';
import Drawer from './Drawer';
import UserMenu from './UserMenu';
import FullscreenButton from './FullscreenButton';
import { useSearchState } from '@/lib/hooks';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/ongoing', label: 'Ongoing' },
  { href: '/completed', label: 'Completed' },
  { href: '/latest', label: 'Latest' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/genre', label: 'Genre' },
  { href: '/premium', label: 'Premium' },
];

export default function Navbar() {
  const [drawer, setDrawer] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { setOpen } = useSearchState();
  const close = useCallback(() => setDrawer(false), []);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 border-b-[3px] border-black bg-surface transition-shadow duration-150',
          scrolled && 'shadow-brutal',
        )}
      >
        <div className="container-x flex h-16 items-center gap-3">
          <button onClick={() => setDrawer(true)} aria-label="Buka menu" className="rounded border-2 border-transparent p-2 text-ink transition hover:border-black hover:bg-gold hover:text-black">
            <Menu size={22} />
          </button>
          <Logo />
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn('rounded border-2 px-3 py-1.5 text-sm font-bold transition duration-100', active ? 'border-black bg-gold text-black shadow-brutal-sm' : 'border-transparent text-ink hover:border-black hover:bg-surface-2')}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <button onClick={() => setOpen(true)} aria-label="Cari donghua" className="rounded border-2 border-transparent p-2 text-ink transition hover:border-black hover:bg-gold hover:text-black">
              <Search size={21} />
            </button>
            <FullscreenButton />
            <UserMenu />
          </div>
        </div>
      </header>
      <Drawer open={drawer} onClose={close} />
    </>
  );
}
