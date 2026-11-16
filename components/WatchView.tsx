'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, List, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { api, smartDetail } from '@/lib/api';
import { getMeta } from '@/lib/context';
import { useApi, useRiwayat } from '@/lib/hooks';
import { seriesSlugFromEpisode } from '@/lib/parse';
import { cn } from '@/lib/utils';
import VideoPlayer from './VideoPlayer';
import ServerPicker from './ServerPicker';
import Comments from './Comments';
import DownloadList from './DownloadList';
import EpisodeList from './EpisodeList';
import EpisodePicker from './EpisodePicker';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

const cleanTitle = (t: string) => t.replace(/\s*[-–]?\s*(episode|eps?)\s*\d+.*$/i, '').trim();

export default function WatchView({ slug }: { slug: string }) {
  const { data, error, loading, retry } = useApi(() => api.episode(slug), [slug]);
  const { add, remove } = useRiwayat();
  const [tab, setTab] = useState<'download' | 'komentar' | 'info'>('download');
  const [serverIdx, setServerIdx] = useState(0);

  // Daftar episode: dari respons episode kalau ada, kalau tidak dari detail series (dengan fallback pencarian).
  const seriesGuess = data ? data.seriesSlug || seriesSlugFromEpisode(slug) : '';
  const series = useApi(() => smartDetail(seriesGuess, { title: data?.title, seriesTitle: data?.seriesTitle }), [seriesGuess], !!data);
  const episodes = data?.episodes.length ? data.episodes : series.data?.detail.episodes ?? [];
  const seriesSlug = series.data?.slug ?? seriesGuess;

  // Simpan ke riwayat otomatis saat episode berhasil dimuat.
  useEffect(() => {
    if (!data) return;
    const guess = data.seriesSlug || seriesSlugFromEpisode(slug);
    const real = series.data?.slug ?? guess;
    if (real !== guess) remove(guess);
    const meta = getMeta(real);
    add({
      slug: real,
      title: data.seriesTitle || series.data?.detail.title || meta?.title || cleanTitle(data.title) || real,
      poster: data.poster || series.data?.detail.poster || meta?.poster || '',
      episodeSlug: slug,
      episodeTitle: data.title || slug,
      timestamp: Date.now(),
    });
    toast.success('Ditambahkan ke riwayat', { id: 'history' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, slug, series.data?.slug]);

  // Server: pakai pilihan terakhir (berdasarkan nama) bila tersedia di episode ini.
  useEffect(() => {
    if (!data) return;
    let pref = '';
    try { pref = localStorage.getItem('dw:server') ?? ''; } catch {}
    const i = data.streams.findIndex((x) => x.name === pref);
    setServerIdx(i >= 0 ? i : 0);
  }, [data]);
  const pickServer = (i: number) => {
    setServerIdx(i);
    try { if (data?.streams[i]) localStorage.setItem('dw:server', data.streams[i].name); } catch {}
  };

  const nav = useMemo(() => {
    if (!data) return { prev: undefined as string | undefined, next: undefined as string | undefined };
    let { prev, next } = data;
    if ((!prev || !next) && episodes.length && episodes.every((e) => e.number !== undefined)) {
      const sorted = [...episodes].sort((a, b) => a.number! - b.number!);
      const i = sorted.findIndex((e) => e.slug === slug);
      if (i >= 0) { prev = prev ?? sorted[i - 1]?.slug; next = next ?? sorted[i + 1]?.slug; }
    }
    return { prev, next };
  }, [data, slug, episodes]);

  if (loading) {
    return <div className="container-x space-y-4 py-8"><div className="skeleton aspect-video w-full rounded-lg" /><div className="skeleton h-7 w-1/2 rounded" /></div>;
  }
  if (error?.status === 404) return <div className="container-x py-12"><EmptyState title="Episode tidak ditemukan" action={<Link href="/" className="btn-primary">Kembali ke Home</Link>} /></div>;
  if (error) return <div className="container-x py-12"><ErrorState message={error.message} onRetry={retry} /></div>;
  const d = data!;

  const navBtn = (target: string | undefined, label: string, icon: 'prev' | 'next') => {
    const content = icon === 'prev' ? <><ChevronLeft size={16} /> {label}</> : <>{label} <ChevronRight size={16} /></>;
    return target
      ? <Link href={`/watch/${target}`} className="btn-secondary">{content}</Link>
      : <span className="btn-secondary pointer-events-none opacity-40">{content}</span>;
  };

  const tabs = [['download', 'Download'], ['komentar', 'Komentar'], ['info', 'Info']] as const;

  return (
    <div className="container-x py-4 sm:py-8">
      <VideoPlayer stream={d.streams[serverIdx]} debugPath={`donghua/episode/${slug}`} />

      <div className="card-brutal mt-4 p-3 sm:p-4">
        <h1 className="font-heading text-lg font-extrabold leading-snug sm:text-2xl">{d.title || slug}</h1>
        <Link href={`/donghua/${seriesSlug}`} className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-gold hover:underline">
          <List size={14} /> {d.seriesTitle || 'Lihat semua episode'}
        </Link>
      </div>

      {/* HP: 2 kolom (Server | Daftar Episode, lalu Sebelumnya | Berikutnya). Layar lebar: satu baris. */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
        <ServerPicker streams={d.streams} index={serverIdx} onSelect={pickServer} />
        <EpisodePicker episodes={episodes} activeSlug={slug} loading={series.loading} />
        {navBtn(nav.prev, 'Sebelumnya', 'prev')}
        {navBtn(nav.next, 'Berikutnya', 'next')}
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          <div role="tablist" className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {tabs.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={cn('inline-flex shrink-0 items-center gap-1.5 rounded border-2 border-black px-4 py-2 text-sm font-extrabold shadow-brutal-sm transition duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                  tab === k ? 'bg-gold text-black' : 'bg-surface-2 text-ink hover:bg-gold/30')}>
                {k === 'komentar' && <MessageSquare size={14} />}{label}
              </button>
            ))}
          </div>
          {tab === 'download' ? (
            <DownloadList groups={d.downloads} />
          ) : tab === 'komentar' ? (
            <Comments slug={slug} />
          ) : Object.keys(d.info).length ? (
            <dl className="card-brutal divide-y-2 divide-black text-sm">
              {Object.entries(d.info).map(([k, v]) => (
                <div key={k} className="flex gap-4 px-4 py-2.5"><dt className="w-28 shrink-0 capitalize text-muted sm:w-32">{k}</dt><dd className="min-w-0 break-words font-medium">{v}</dd></div>
              ))}
            </dl>
          ) : (
            <EmptyState title="Belum ada info episode" />
          )}
        </div>

        {episodes.length > 0 && (
          <aside className="min-w-0">
            <h2 className="mb-2 font-heading text-base font-extrabold">Episode lainnya <span className="text-sm font-semibold text-muted">({episodes.length})</span></h2>
            <EpisodeList episodes={episodes} activeSlug={slug} searchable={episodes.length > 12} variant="grid" maxHeight="15rem" />
          </aside>
        )}
      </div>
    </div>
  );
}
