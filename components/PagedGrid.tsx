'use client';
import { ReactNode, Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { SearchX } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { humanize } from '@/lib/utils';
import DonghuaGrid from './DonghuaGrid';
import { SkeletonGrid } from './SkeletonCard';
import Pagination from './Pagination';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';

export type Kind = 'ongoing' | 'completed' | 'latest' | 'genre' | 'season' | 'search' | 'az';
interface Props { kind: Kind; arg?: string; title?: string; description?: string; header?: ReactNode }

function Inner({ kind, arg = '', title, description, header }: Props) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1);
  const q = (sp.get('q') ?? '').trim();
  const letter = (sp.get('l') ?? 'A').toUpperCase();

  const noQuery = kind === 'search' && !q;
  const { data, error, loading, retry } = useApi(
    () => {
      switch (kind) {
        case 'ongoing': return api.ongoing(page);
        case 'completed': return api.completed(page);
        case 'latest': return api.latest(page);
        case 'genre': return api.byGenre(arg, page);
        case 'season': return api.season(arg, page);
        case 'search': return api.search(q, page);
        case 'az': return api.az(letter, page);
      }
    },
    [kind, arg, q, letter, page],
    !noQuery,
  );

  useEffect(() => {
    if (kind === 'search' && data && data.items.length === 0) toast.error('Keyword tidak ditemukan', { id: 'notfound' });
  }, [kind, data]);

  const makeHref = (p: number) => {
    const next = new URLSearchParams(sp.toString());
    if (p <= 1) next.delete('page'); else next.set('page', String(p));
    const s = next.toString();
    return s ? `${pathname}?${s}` : pathname;
  };

  const heading = title ?? (kind === 'search' ? `Hasil pencarian “${q}”` : kind === 'genre' ? `Genre: ${humanize(arg)}` : kind === 'season' ? `Donghua ${arg}` : '');
  const notFound = error?.status === 404 || (data && data.items.length === 0);

  return (
    <div className="container-x py-8">
      {heading && <h1 className="font-heading text-2xl font-bold sm:text-3xl">{heading}</h1>}
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      {header && <div className="mt-5">{header}</div>}
      <div className="mt-6">
        {noQuery ? (
          <EmptyState icon={<SearchX size={32} />} title="Mau nonton apa?" message="Klik ikon cari di pojok kanan atas, lalu ketik judul donghua." />
        ) : loading ? (
          <SkeletonGrid />
        ) : notFound ? (
          <EmptyState title="Tidak ada hasil" message={kind === 'search' ? `Tidak ada donghua dengan kata kunci “${q}”. Coba kata kunci lain.` : 'Belum ada donghua di halaman ini.'} />
        ) : error ? (
          <ErrorState message={error.message} onRetry={retry} />
        ) : data ? (
          <>
            <DonghuaGrid items={data.items} />
            <Pagination current={data.page.current || page} total={data.page.total} hasNext={data.page.hasNext ?? data.items.length >= 10} makeHref={makeHref} />
          </>
        ) : null}
      </div>
    </div>
  );
}

export default function PagedGrid(props: Props) {
  return <Suspense fallback={<div className="container-x py-8"><SkeletonGrid /></div>}><Inner {...props} /></Suspense>;
}
