'use client';
import { useEffect, useState } from 'react';
import { Maximize, Minimize } from 'lucide-react';

/** Tombol layar penuh untuk seluruh situs (tidak tampil di browser yang tidak mendukung, mis. iPhone). */
export default function FullscreenButton() {
  const [supported, setSupported] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    setSupported(typeof document.documentElement.requestFullscreen === 'function');
    const h = () => setOn(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  if (!supported) return null;
  const toggle = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen().catch(() => {});
  };
  return (
    <button data-no-ad onClick={toggle} aria-label={on ? 'Keluar layar penuh' : 'Layar penuh'}
      className="rounded border-2 border-transparent p-2 text-ink transition hover:border-black hover:bg-gold hover:text-black">
      {on ? <Minimize size={21} /> : <Maximize size={21} />}
    </button>
  );
}
