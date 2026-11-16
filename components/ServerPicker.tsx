'use client';
import { useCallback, useState } from 'react';
import { Check, Server } from 'lucide-react';
import type { Stream } from '@/lib/types';
import { cn } from '@/lib/utils';
import Modal from './Modal';

export default function ServerPicker({ streams, index, onSelect }: { streams: Stream[]; index: number; onSelect: (i: number) => void }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const current = streams[index];

  return (
    <>
      <button onClick={() => setOpen(true)} disabled={!streams.length} className="btn-primary min-w-0">
        <Server size={16} className="shrink-0" />
        <span className="truncate">Server{current ? `: ${current.name}` : ''}</span>
      </button>
      <Modal open={open} onClose={close} title={<>Pilih Server <span className="font-medium">({streams.length})</span></>}>
        <p className="mb-3 text-xs text-muted">Video tidak jalan atau patah-patah? Coba server lain.</p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {streams.map((s, i) => {
            const active = i === index;
            return (
              <li key={s.url}>
                <button
                  onClick={() => { onSelect(i); close(); }}
                  className={cn(
                    'flex w-full min-w-0 items-center gap-3 rounded border-2 border-black px-3 py-3 text-left text-sm font-bold shadow-brutal-sm transition duration-100 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none',
                    active ? 'bg-gold text-black' : 'bg-surface-2 text-ink hover:bg-gold/30',
                  )}
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded border-2 border-black bg-bg text-xs text-ink">{i + 1}</span>
                  <span className="flex-1 truncate capitalize">{s.name}</span>
                  {active && <Check size={18} className="shrink-0" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
