'use client';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'];

function Row() {
  const current = (useSearchParams().get('l') ?? 'A').toUpperCase();
  return (
    <div className="flex flex-wrap gap-2">
      {LETTERS.map((l) => (
        <Link
          key={l}
          href={`/az-list?l=${encodeURIComponent(l)}`}
          aria-current={l === current ? 'page' : undefined}
          className={cn(
            'grid h-10 w-10 place-items-center rounded-md border text-sm font-semibold transition duration-200',
            l === current ? 'border-black bg-gold text-black shadow-brutal-sm' : 'border-line bg-surface hover:border-gold hover:text-gold',
          )}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}

export default function AzLetters() {
  return <Suspense fallback={null}><Row /></Suspense>;
}
