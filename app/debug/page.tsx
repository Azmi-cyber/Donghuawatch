'use client';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const path = sp.get('path') ?? 'donghua/schedule';
  const [input, setInput] = useState(path);
  const [out, setOut] = useState('Memuat...');

  useEffect(() => {
    setInput(path);
    setOut('Memuat...');
    fetch(`/api/proxy/${path.replace(/^\/+/, '')}`)
      .then(async (r) => `HTTP ${r.status}\n\n` + (await r.text()))
      .then((t) => {
        try { setOut(t.replace(/^(HTTP \d+\n\n)([\s\S]*)$/, (_, h, b) => h + JSON.stringify(JSON.parse(b), null, 2))); } catch { setOut(t); }
      })
      .catch((e) => setOut('Gagal: ' + String(e)));
  }, [path]);

  const submit = (e: FormEvent) => { e.preventDefault(); router.push(`/debug?path=${encodeURIComponent(input)}`); };

  return (
    <div className="container-x py-8">
      <h1 className="font-heading text-2xl font-bold">Debug respons API</h1>
      <p className="mt-1 text-sm text-muted">Contoh: donghua/schedule · donghua/episode/slug-episode · donghua/detail/slug</p>
      <form onSubmit={submit} className="mt-4 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm outline-none focus:border-gold" />
        <button className="btn-primary">Ambil</button>
      </form>
      <pre className="mt-4 max-h-[70vh] overflow-auto whitespace-pre-wrap break-all rounded-lg border border-line bg-surface p-4 text-xs">{out.slice(0, 30000)}</pre>
    </div>
  );
}

export default function DebugPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}
