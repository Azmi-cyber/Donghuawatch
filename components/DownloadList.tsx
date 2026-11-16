'use client';
import { useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import type { DownloadGroup } from '@/lib/types';
import { cn } from '@/lib/utils';
import EmptyState from './EmptyState';

/** Akordeon per kualitas: hanya grup pertama terbuka, sisanya ringkas satu baris. */
export default function DownloadList({ groups }: { groups: DownloadGroup[] }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set(groups[0] ? [groups[0].quality] : []));
  if (!groups.length) return <EmptyState icon={<Download size={30} />} title="Link download belum tersedia" message="Episode ini belum punya link download." />;

  const toggle = (q: string) => setOpen((prev) => { const n = new Set(prev); n.has(q) ? n.delete(q) : n.add(q); return n; });

  return (
    <div className="space-y-2">
      {groups.map((g) => {
        const isOpen = open.has(g.quality);
        return (
          <div key={g.quality} className="overflow-hidden rounded border-2 border-black bg-surface shadow-brutal-sm">
            <button
              onClick={() => toggle(g.quality)}
              aria-expanded={isOpen}
              className={cn('flex w-full items-center gap-3 px-3 py-2.5 text-left transition', isOpen ? 'bg-gold text-black' : 'bg-surface-2 hover:bg-gold/30')}
            >
              <Download size={16} className="shrink-0" />
              <span className="flex-1 truncate font-heading text-sm font-extrabold">{g.quality}</span>
              <span className="rounded border-2 border-black bg-bg px-1.5 text-xs font-bold text-ink">{g.links.length}</span>
              <ChevronDown size={18} className={cn('shrink-0 transition-transform', isOpen && 'rotate-180')} />
            </button>
            {isOpen && (
              <div className="grid grid-cols-2 gap-2 border-t-2 border-black p-2.5 sm:grid-cols-3">
                {g.links.map((l, i) => (
                  <a key={`${l.url}-${i}`} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-secondary min-w-0 !px-2 !py-2 text-xs">
                    <span className="truncate">{l.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
