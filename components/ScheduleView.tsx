'use client';
import { useMemo } from 'react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useDetailPosters } from '@/lib/useDetailPosters';
import { todayIndex } from '@/lib/parse';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import DonghuaGrid from './DonghuaGrid';
import { SkeletonGrid } from './SkeletonCard';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

export default function ScheduleView() {
  const { data, error, loading, retry } = useApi(() => api.schedule(), []);
  const today = todayIndex();
  const allItems = useMemo(() => (data ? data.flatMap((d) => d.items) : []), [data]);
  const posters = useDetailPosters(allItems);

  return (
    <div className="container-x py-8">
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Jadwal Rilis</h1>
      <p className="mt-1 text-sm text-muted">Donghua yang tayang tiap hari.</p>
      <div className="mt-6 space-y-8">
        {loading ? <SkeletonGrid count={12} />
          : error ? <div className="space-y-3"><ErrorState message={error.message} onRetry={retry} /><p className="text-center text-sm"><Link href="/debug?path=donghua/schedule" className="text-gold underline">Lihat respons mentah</Link></p></div>
          : !data?.length ? <EmptyState title="Jadwal tidak terbaca" message="Respons API ada tapi bentuknya belum dikenali parser." action={<Link href="/debug?path=donghua/schedule" className="btn-secondary">Lihat respons mentah</Link>} />
          : data.map((day) => {
              const isToday = day.index === today;
              return (
                <section key={day.index} className={cn('rounded-lg border p-4 sm:p-5', isToday ? 'border-gold bg-gold/[.04] shadow-gold-sm' : 'border-line')}>
                  <div className="mb-4 flex items-center gap-3">
                    <h2 className="font-heading text-lg font-bold sm:text-xl">{day.label}</h2>
                    {isToday && <span className="badge">Hari Ini</span>}
                  </div>
                  <DonghuaGrid
                    items={day.items.map((it) => {
                      const p = posters[it.slug]; // undefined = masih dimuat → placeholder; '' = gagal → poster bawaan
                      return { ...it, poster: p === undefined ? '' : p || it.poster };
                    })}
                  />
                </section>
              );
            })}
      </div>
    </div>
  );
}
