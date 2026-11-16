'use client';
import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { List, Loader2 } from 'lucide-react';
import type { EpisodeRef } from '@/lib/types';
import EpisodeList from './EpisodeList';
import Modal from './Modal';

export default function EpisodePicker({ episodes, activeSlug, loading }: { episodes: EpisodeRef[]; activeSlug: string; loading?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const close = useCallback(() => setOpen(false), []);
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button onClick={() => setOpen(true)} disabled={!episodes.length && !loading} className="btn-secondary min-w-0">
        {loading && !episodes.length ? <Loader2 size={16} className="animate-spin" /> : <List size={16} className="shrink-0" />}
        <span className="truncate">Daftar Episode</span>
      </button>
      <Modal open={open} onClose={close} title={<>Daftar Episode <span className="font-medium">({episodes.length})</span></>}>
        <EpisodeList episodes={episodes} activeSlug={activeSlug} searchable variant="grid" maxHeight="55vh" />
      </Modal>
    </>
  );
}
