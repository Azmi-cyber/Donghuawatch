'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Play, Plus, Star } from 'lucide-react';
import { toast } from 'sonner';
import { smartDetail } from '@/lib/api';
import { rememberMeta } from '@/lib/context';
import { useApi, useRiwayat } from '@/lib/hooks';
import type { EpisodeRef } from '@/lib/types';
import { imageUrl, PLACEHOLDER_URI } from '@/lib/utils';
import GenrePill from './GenrePill';
import EpisodeList from './EpisodeList';
import DonghuaGrid from './DonghuaGrid';
import SectionHeader from './SectionHeader';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

function firstEpisode(eps: EpisodeRef[]): EpisodeRef | undefined {
  if (!eps.length) return undefined;
  if (eps.every((e) => e.number !== undefined)) return eps.reduce((a, b) => (b.number! < a.number! ? b : a));
  return eps[eps.length - 1];
}

export default function DetailView({ slug }: { slug: string }) {
  const { data: res, error, loading, retry } = useApi(() => smartDetail(slug), [slug]);
  const data = res?.detail ?? null;
  const realSlug = res?.slug ?? slug;
  const { add } = useRiwayat();
  const router = useRouter();

  // Slug di URL sudah usang → ganti ke slug yang benar (tanpa menambah entri history browser).
  useEffect(() => {
    const cur = (() => { try { return decodeURIComponent(slug); } catch { return slug; } })();
    if (res && res.slug !== slug && res.slug !== cur) router.replace(`/donghua/${encodeURIComponent(res.slug)}`, { scroll: false });
  }, [res, slug, router]);

  useEffect(() => {
    if (data) { rememberMeta(realSlug, { title: data.title, poster: data.poster }); rememberMeta(slug, { title: data.title, poster: data.poster }); }
  }, [data, slug, realSlug]);

  if (loading) {
    return (
      <div className="container-x py-8">
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="skeleton aspect-[3/4] w-56 shrink-0 self-center rounded-lg md:self-start" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-8 w-2/3 rounded" /><div className="skeleton h-4 w-1/3 rounded" />
            <div className="skeleton h-24 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }
  if (error?.status === 404) return <div className="container-x py-12"><EmptyState title="Donghua tidak ditemukan" message="Slug ini tidak ada di sumber data." action={<Link href="/" className="btn-primary">Kembali ke Home</Link>} /></div>;
  if (error) return <div className="container-x py-12"><ErrorState message={error.message} onRetry={retry} /></div>;
  const d = data!;
  const first = firstEpisode(d.episodes);

  const addToHistory = () => {
    if (!first) { toast.error('Belum ada episode untuk ditambahkan'); return; }
    add({ slug: realSlug, title: d.title, poster: d.poster, episodeSlug: first.slug, episodeTitle: first.title, timestamp: Date.now() });
    toast.success('Ditambahkan ke riwayat');
  };

  const facts: [string, string][] = ([['Status', d.status], ['Tipe', d.type], ['Tahun', d.year], ['Studio', d.studio], ['Durasi', d.duration]] as [string, string][]).filter(([, v]) => v);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl(d.poster)} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-15 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg to-bg/40" />
        <div className="container-x relative flex flex-col gap-6 py-8 md:flex-row md:py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl(d.poster)} alt={d.title}
            onError={(e) => { e.currentTarget.src = PLACEHOLDER_URI; }}
            className="aspect-[3/4] w-52 self-center rounded-lg border border-gold/50 object-cover shadow-glow md:w-64 md:self-start"
          />
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{d.title || slug}</h1>
            {d.altTitle && <p className="mt-1 text-sm text-muted">{d.altTitle}</p>}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {d.rating && <span className="badge gap-1"><Star size={12} fill="currentColor" /> {d.rating}</span>}
              {d.status && <span className="badge">{d.status}</span>}
              {d.episodes.length > 0 && <span className="badge gap-1"><Clock size={12} /> {d.episodes.length} episode</span>}
            </div>

            {d.genres.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{d.genres.map((g) => <GenrePill key={g.slug} genre={g} />)}</div>}
            {d.synopsis && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-ink/90 sm:text-base">{d.synopsis}</p>}

            {facts.length > 0 && (
              <dl className="mt-4 grid max-w-xl grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="flex gap-2"><dt className="text-muted">{k}</dt><dd className="font-medium">{v}</dd></div>
                ))}
              </dl>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {first ? (
                <Link href={`/watch/${first.slug}`} className="btn-primary"><Play size={16} fill="currentColor" /> Tonton Sekarang</Link>
              ) : (
                <button className="btn-primary" disabled><Play size={16} /> Tonton Sekarang</button>
              )}
              <button onClick={addToHistory} className="btn-secondary"><Plus size={16} /> Tambah ke Riwayat</button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-x space-y-12 py-10">
        <section>
          <SectionHeader title="Daftar Episode" />
          {d.episodes.length ? <EpisodeList episodes={d.episodes} searchable={d.episodes.length > 12} /> : (
            <EmptyState title="Daftar episode tidak terbaca" message="Respons API ada, tapi daftar episodenya belum dikenali parser." action={<Link href={`/debug?path=${encodeURIComponent('donghua/detail/' + realSlug)}`} className="btn-secondary">Lihat respons mentah</Link>} />
          )}
        </section>
        {d.recommendations.length > 0 && (
          <section>
            <SectionHeader title="Rekomendasi" />
            <DonghuaGrid items={d.recommendations} scroll limit={12} />
          </section>
        )}
      </div>
    </>
  );
}
