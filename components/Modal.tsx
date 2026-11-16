'use client';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

/** Bottom sheet di HP, dialog di tengah di layar lebar. */
export default function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-lg border-2 border-black bg-surface shadow-brutal-gold sm:max-w-lg sm:rounded-lg">
        <div className="flex items-center justify-between gap-3 border-b-2 border-black bg-gold px-4 py-2.5 text-black">
          <h2 className="font-heading text-base font-extrabold">{title}</h2>
          <button onClick={onClose} aria-label="Tutup" className="grid h-9 w-9 place-items-center rounded border-2 border-black bg-surface-2 text-ink shadow-brutal-sm transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">{children}</div>
      </div>
    </div>
  );
}
