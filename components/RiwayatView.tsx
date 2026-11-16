'use client';
import { History, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRiwayat } from '@/lib/hooks';
import { timeAgo } from '@/lib/utils';
import DonghuaCard from './DonghuaCard';
import EmptyState from './EmptyState';
import Link from 'next/link';

export default function RiwayatView() {
  const { history, ready, clear } = useRiwayat();

  const onClear = () => {
    if (window.confirm('Hapus semua riwayat tontonan?')) { clear(); toast.success('Riwayat dihapus'); }
  };

  return (
    <div className="container-x py-8">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">Riwayat Tontonan</h1>
        {history.length > 0 && <button onClick={onClear} className="btn-secondary"><Trash2 size={16} /> Hapus Semua</button>}
      </div>
      <div className="mt-6">
        {!ready ? null : history.length === 0 ? (
          <EmptyState icon={<History size={32} />} title="Belum ada riwayat" message="Episode yang kamu tonton akan muncul di sini." action={<Link href="/" className="btn-primary">Mulai menonton</Link>} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {history.map((h) => (
              <DonghuaCard
                key={h.slug}
                meta={`${h.episodeTitle} · ${timeAgo(h.timestamp)}`}
                item={{ slug: h.slug, title: h.title, poster: h.poster, href: `/watch/${h.episodeSlug}`, genres: [] }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
