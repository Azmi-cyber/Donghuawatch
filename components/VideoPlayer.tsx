'use client';
import Link from 'next/link';
import { MonitorX } from 'lucide-react';
import type { Stream } from '@/lib/types';

/** Hanya menampilkan player. Pemilihan server ada di <ServerPicker /> (tombol "Server"). */
export default function VideoPlayer({ stream, debugPath }: { stream?: Stream; debugPath?: string }) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border-[3px] border-black bg-black shadow-brutal-gold">
      {stream ? (
        <iframe
          key={stream.url}
          src={stream.url}
          title="Video player"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          referrerPolicy="origin"
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-muted">
          <div>
            <MonitorX className="mx-auto mb-2 text-gold" size={34} />
            <p className="text-sm font-semibold">Video belum tersedia untuk episode ini.</p>
            {debugPath && <Link href={`/debug?path=${encodeURIComponent(debugPath)}`} className="mt-2 inline-block text-xs text-gold underline">Lihat respons mentah</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
