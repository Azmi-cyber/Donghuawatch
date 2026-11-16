'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, X } from 'lucide-react';
import { useSearchState } from '@/lib/hooks';

export default function SearchModal() {
  const { open, setOpen, recent, addRecent, removeRecent, clearRecent } = useSearchState();
  const [q, setQ] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => ref.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, setOpen]);

  if (!open) return null;

  const go = (kw: string) => {
    const k = kw.trim();
    if (!k) return;
    addRecent(k);
    setOpen(false);
    setQ('');
    router.push(`/search?q=${encodeURIComponent(k)}`);
  };
  const submit = (e: FormEvent) => { e.preventDefault(); go(q); };

  return (
    <div className="fixed inset-0 z-[70] md:flex md:items-start md:justify-end md:p-4 md:pt-[72px]" role="dialog" aria-label="Pencarian">
      <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
      <div className="relative flex h-full w-full flex-col bg-surface p-4 md:h-auto md:max-h-[80vh] md:w-[440px] md:rounded-lg md:border-2 md:border-black md:shadow-brutal-gold">
        <form onSubmit={submit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={ref}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari donghua..."
              className="w-full rounded-md border border-line bg-surface-2 py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition duration-200 placeholder:text-muted focus:border-gold"
            />
          </div>
          <button type="submit" className="btn-primary">Cari</button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup pencarian" className="rounded-md p-2 text-muted transition hover:bg-gold/10 hover:text-gold md:hidden">
            <X size={20} />
          </button>
        </form>

        {recent.length > 0 && (
          <div className="mt-4 overflow-y-auto">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>Pencarian terakhir</span>
              <button onClick={clearRecent} className="text-gold hover:underline">Hapus semua</button>
            </div>
            <ul>
              {recent.map((r) => (
                <li key={r} className="group flex items-center rounded-md transition hover:bg-gold/10">
                  <button onClick={() => go(r)} className="flex flex-1 items-center gap-2 px-2 py-2.5 text-left text-sm">
                    <Clock size={15} className="text-gold" /> {r}
                  </button>
                  <button onClick={() => removeRecent(r)} aria-label={`Hapus ${r}`} className="p-2 text-muted hover:text-gold">
                    <X size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
