'use client';
import { useEffect, useState } from 'react';
import { smartDetail } from './api';
import { getMeta, rememberMeta } from './context';
import type { Item } from './types';

/**
 * Ambil poster dari halaman DETAIL tiap donghua (bukan dari data jadwal).
 * Hasil: slug → URL poster. Nilai '' = gagal diambil (pakai poster bawaan item).
 * Slug yang belum ada di hasil = masih dimuat. Poster yang pernah dimuat disimpan di localStorage.
 */
export function useDetailPosters(items: Item[]): Record<string, string> {
  const [map, setMap] = useState<Record<string, string>>({});
  const sig = items.map((i) => i.slug).join('|');

  useEffect(() => {
    let off = false;
    const slugs = Array.from(new Set(items.map((i) => i.slug))).filter(Boolean);
    const titles = new Map<string, string>(items.map((i) => [i.slug, i.title] as [string, string]));

    const init: Record<string, string> = {};
    for (const s of slugs) { const m = getMeta(s); if (m?.poster) init[s] = m.poster; }
    setMap(init);

    const queue = slugs.filter((s) => !init[s]);
    let next = 0;
    const worker = async () => {
      while (!off && next < queue.length) {
        const s = queue[next++];
        let poster = '';
        try {
          const r = await smartDetail(s, { title: titles.get(s) });
          poster = r.detail.poster || '';
          if (poster) rememberMeta(s, { title: r.detail.title, poster });
        } catch {}
        if (!off) setMap((p) => ({ ...p, [s]: poster }));
      }
    };
    void Promise.all([worker(), worker(), worker(), worker()]); // 4 request paralel

    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  return map;
}
