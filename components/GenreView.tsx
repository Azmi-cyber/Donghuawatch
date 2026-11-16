'use client';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import GenrePill from './GenrePill';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

export default function GenreView() {
  const { data, error, loading, retry } = useApi(() => api.genres(), []);
  const year = new Date().getFullYear();

  return (
    <div className="container-x py-8">
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">Genre</h1>
      <div className="mt-6">
        {loading ? (
          <div className="flex flex-wrap gap-2">{Array.from({ length: 24 }).map((_, i) => <div key={i} className="skeleton h-9 w-24 rounded-full" />)}</div>
        ) : error ? <ErrorState message={error.message} onRetry={retry} />
          : !data?.length ? <EmptyState title="Genre belum tersedia" />
          : <div className="flex flex-wrap gap-2.5">{data.map((g) => <GenrePill key={g.slug} genre={g} />)}</div>}
      </div>

      <h2 className="mt-12 font-heading text-xl font-bold">Berdasarkan Tahun</h2>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Link key={i} href={`/season/${year - i}`} className="rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-sm transition duration-200 hover:border-gold hover:bg-gold/10 hover:text-gold">
            {year - i}
          </Link>
        ))}
      </div>
    </div>
  );
}
