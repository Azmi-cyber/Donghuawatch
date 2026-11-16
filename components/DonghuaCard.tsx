'use client';
import Link from 'next/link';
import { prefetchHref } from '@/lib/api';
import type { Item } from '@/lib/types';
import { cn, imageUrl, PLACEHOLDER_URI } from '@/lib/utils';

export default function DonghuaCard({ item, meta, className }: { item: Item; meta?: string; className?: string }) {
  return (
    <Link
      href={item.href}
      onMouseEnter={() => prefetchHref(item.href)}
      onTouchStart={() => prefetchHref(item.href)}
      className={cn(
        'group block overflow-hidden rounded-lg border-2 border-black bg-surface shadow-brutal transition duration-100',
        'hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal-gold active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
        className,
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden border-b-2 border-black bg-surface-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(item.poster)}
          alt={item.title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => { if (e.currentTarget.src !== PLACEHOLDER_URI) e.currentTarget.src = PLACEHOLDER_URI; }}
          className="h-full w-full object-cover transition duration-300 group-hover:brightness-110"
        />
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {item.episode && <span className="badge">{item.episode}</span>}
        </div>
        {item.status && <span className="badge absolute right-2 top-2 !bg-ink">{item.status}</span>}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink transition group-hover:underline decoration-2 underline-offset-2">{item.title}</h3>
        {(meta || item.time) && <p className="mt-1 text-xs text-muted">{meta ?? item.time}</p>}
      </div>
    </Link>
  );
}
