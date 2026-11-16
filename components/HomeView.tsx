'use client';
import Link from 'next/link';
import { Info, Play } from 'lucide-react';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import type { Item, ListResult } from '@/lib/types';
import { imageUrl, PLACEHOLDER_URI } from '@/lib/utils';
import DonghuaGrid from './DonghuaGrid';
import { SkeletonGrid } from './SkeletonCard';
import SectionHeader from './SectionHeader';
import GenrePill from './GenrePill';
import ErrorState from './ErrorState';

function Hero({ item }: { item: Item }) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl(item.poster)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-20 blur-2xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
      <div className="container-x relative flex flex-col items-center gap-6 py-10 sm:flex-row sm:items-end sm:py-14">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl(item.poster)}
          alt={item.title}
          onError={(e) => { e.currentTarget.src = PLACEHOLDER_URI; }}
          className="aspect-[3/4] w-44 rounded-lg border border-gold/50 object-cover shadow-glow sm:w-56"
        />
        <div className="max-w-2xl text-center sm:text-left">
          <div className="mb-3 flex flex-wrap justify-center gap-2 sm:justify-start">
            {item.episode && <span className="badge">{item.episode}</span>}
            {item.status && <span className="badge">{item.status}</span>}
            {item.type && <span className="badge">{item.type}</span>}
          </div>
          <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{item.title}</h1>
          {item.synopsis && <p className="mt-3 line-clamp-3 text-sm text-muted sm:text-base">{item.synopsis}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link href={item.href} className="btn-primary"><Play size={16} fill="currentColor" /> Tonton Sekarang</Link>
            <Link href={`/donghua/${item.slug}`} className="btn-secondary"><Info size={16} /> Detail</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Pakai data dari /home bila ada; kalau kosong, fallback ke endpoint khusus. */
function Section({ title, href, items, fallback, scroll }: {
  title: string; href: string; items: Item[]; fallback: () => Promise<ListResult>; scroll?: boolean;
}) {
  const need = items.length === 0;
  const fb = useApi(fallback, [title], need);
  const list = need ? fb.data?.items ?? [] : items;

  return (
    <section>
      <SectionHeader title={title} href={href} />
      {need && fb.loading ? <SkeletonGrid count={6} />
        : need && fb.error ? <ErrorState message={fb.error.message} onRetry={fb.retry} />
        : list.length ? <DonghuaGrid items={list} scroll={scroll} limit={12} />
        : <p className="text-sm text-muted">Belum ada data.</p>}
    </section>
  );
}

export default function HomeView() {
  const home = useApi(() => api.home(1), []);
  const genres = useApi(() => api.genres(), []);

  if (home.loading) {
    return <div className="container-x space-y-10 py-8"><div className="skeleton h-72 rounded-lg" /><SkeletonGrid count={12} /></div>;
  }
  if (home.error) return <div className="container-x py-12"><ErrorState message={home.error.message} onRetry={home.retry} /></div>;
  const d = home.data!;

  return (
    <>
      {d.hero && <Hero item={d.hero} />}
      <div className="container-x space-y-12 py-10">
        <Section title="Latest Update" href="/latest" items={d.latest} fallback={() => api.latest(1)} />
        <Section title="Ongoing" href="/ongoing" items={d.ongoing} fallback={() => api.ongoing(1)} scroll />
        <Section title="Completed" href="/completed" items={d.completed} fallback={() => api.completed(1)} />
        <section>
          <SectionHeader title="Genre Populer" href="/genre" />
          {genres.loading ? (
            <div className="flex flex-wrap gap-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-9 w-24 rounded-full" />)}</div>
          ) : genres.error ? (
            <ErrorState message={genres.error.message} onRetry={genres.retry} />
          ) : (
            <div className="flex flex-wrap gap-2">{(genres.data ?? []).slice(0, 12).map((g) => <GenrePill key={g.slug} genre={g} />)}</div>
          )}
        </section>
      </div>
    </>
  );
}
