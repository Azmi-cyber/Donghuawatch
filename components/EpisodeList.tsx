'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Search } from 'lucide-react';
import type { EpisodeRef } from '@/lib/types';
import { cn } from '@/lib/utils';

type Variant = 'list' | 'grid';

/**
 * variant="grid": kotak nomor episode yang ringkas (cocok untuk ratusan episode, mudah di-tap di HP).
 * Otomatis kembali ke "list" bila episode tidak punya nomor.
 */
export default function EpisodeList({
  episodes, activeSlug, searchable = false, maxHeight = '28rem', variant = 'list',
}: { episodes: EpisodeRef[]; activeSlug?: string; searchable?: boolean; maxHeight?: string; variant?: Variant }) {
  const [q, setQ] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);

  const numbered = episodes.length > 0 && episodes.every((e) => e.number !== undefined);
  const mode: Variant = variant === 'grid' && numbered ? 'grid' : 'list';

  const list = useMemo(() => {
    const base = mode === 'grid' ? [...episodes].sort((a, b) => a.number! - b.number!) : episodes;
    const t = q.trim().toLowerCase();
    if (!t) return base;
    return base.filter((e) => e.title.toLowerCase().includes(t) || String(e.number ?? '') === t.replace(/^(ep|episode)\s*/, ''));
  }, [episodes, q, mode]);

  // Gulir ke episode aktif di dalam kotak saja (halaman tidak ikut bergeser).
  useEffect(() => {
    const box = boxRef.current, el = activeRef.current;
    if (box && el) box.scrollTop = el.offsetTop - box.clientHeight / 2 + el.clientHeight / 2;
  }, [activeSlug, episodes.length, mode]);

  if (!episodes.length) return <p className="text-sm text-muted">Belum ada episode.</p>;

  return (
    <div>
      {searchable && (
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q} onChange={(e) => setQ(e.target.value)} inputMode={mode === 'grid' ? 'search' : undefined}
            placeholder={`Cari dari ${episodes.length} episode… (mis. 219)`}
            className="w-full rounded border-2 border-black bg-surface-2 py-2.5 pl-9 pr-3 text-sm font-medium outline-none placeholder:text-muted focus:bg-bg focus:shadow-brutal-sm"
          />
        </div>
      )}
      <div ref={boxRef} style={{ maxHeight }} className="relative overflow-y-auto rounded border-2 border-black bg-bg/60 p-2">
        {list.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">Episode tidak ditemukan.</p>}

        {mode === 'grid' ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(3.25rem,1fr))] gap-1.5">
            {list.map((ep) => {
              const active = ep.slug === activeSlug;
              return (
                <Link
                  key={ep.slug}
                  ref={active ? activeRef : undefined}
                  href={`/watch/${ep.slug}`}
                  title={ep.title}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'grid h-11 place-items-center rounded border-2 border-black text-sm font-extrabold transition duration-100 active:translate-y-0.5',
                    active ? 'bg-gold text-black shadow-brutal-sm' : 'bg-surface-2 text-ink hover:bg-gold hover:text-black',
                  )}
                >
                  {ep.number}
                </Link>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-1.5">
            {list.map((ep) => {
              const active = ep.slug === activeSlug;
              return (
                <li key={ep.slug}>
                  <Link
                    ref={active ? activeRef : undefined}
                    href={`/watch/${ep.slug}`}
                    className={cn(
                      'flex items-center gap-3 rounded border-2 px-3 py-2.5 text-sm font-semibold transition duration-100',
                      active ? 'border-black bg-gold text-black shadow-brutal-sm' : 'border-transparent hover:border-black hover:bg-surface-2',
                    )}
                  >
                    <Play size={14} className={cn('shrink-0', active ? 'text-black' : 'text-gold')} />
                    <span className="flex-1 truncate">{ep.title}</span>
                    {ep.number !== undefined && !active && <span className="badge">Ep {ep.number}</span>}
                    {ep.date && <span className="hidden text-xs opacity-70 sm:inline">{ep.date}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
