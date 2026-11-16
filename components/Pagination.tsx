import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function pages(current: number, total: number): (number | '…')[] {
  const set = new Set<number>([1, total, current, current - 1, current + 1, current - 2, current + 2]);
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}

export default function Pagination({
  current, total, hasNext, makeHref,
}: { current: number; total?: number; hasNext?: boolean; makeHref: (page: number) => string }) {
  const canPrev = current > 1;
  const canNext = hasNext ?? (total ? current < total : false);
  if (!canPrev && !canNext) return null;

  const btn = 'inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition duration-200';
  const off = 'pointer-events-none border-line text-muted/40';

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Halaman">
      <Link href={makeHref(current - 1)} aria-disabled={!canPrev} tabIndex={canPrev ? 0 : -1} className={cn(btn, canPrev ? 'border-line hover:border-gold hover:text-gold' : off)}>
        <ChevronLeft size={16} /> <span className="hidden sm:inline">Sebelumnya</span>
      </Link>
      {total
        ? pages(current, total).map((p, i) =>
            p === '…' ? (
              <span key={`e${i}`} className="px-1 text-muted">…</span>
            ) : (
              <Link key={p} href={makeHref(p)} aria-current={p === current ? 'page' : undefined}
                className={cn(btn, p === current ? 'border-black bg-gold text-black shadow-brutal-sm' : 'border-line hover:border-gold hover:text-gold')}>
                {p}
              </Link>
            ),
          )
        : <span className={cn(btn, 'border-black bg-gold text-black shadow-brutal-sm')}>{current}</span>}
      <Link href={makeHref(current + 1)} aria-disabled={!canNext} tabIndex={canNext ? 0 : -1} className={cn(btn, canNext ? 'border-line hover:border-gold hover:text-gold' : off)}>
        <span className="hidden sm:inline">Berikutnya</span> <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
