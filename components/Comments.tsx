'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Loader2, LogIn, MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { timeAgo } from '@/lib/utils';

interface C { id: string; uid: string; name: string; image: string; text: string; ts: number }
const MAX = 500;

function Avatar({ name, image }: { name: string; image: string }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt="" referrerPolicy="no-referrer" className="h-9 w-9 shrink-0 rounded border-2 border-black object-cover" />
  ) : (
    <span className="grid h-9 w-9 shrink-0 place-items-center rounded border-2 border-black bg-gold text-sm font-extrabold text-black">{name.charAt(0).toUpperCase() || '?'}</span>
  );
}

export default function Comments({ slug }: { slug: string }) {
  const { data: session, status } = useSession();
  const [items, setItems] = useState<C[]>([]);
  const [meUid, setMeUid] = useState('');
  const [persistent, setPersistent] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' });
      if (!r.ok) throw new Error();
      const j = await r.json();
      setItems(j.comments ?? []); setMeUid(j.me ?? ''); setPersistent(j.persistent !== false);
    } catch { setError('Komentar gagal dimuat.'); }
    finally { setLoading(false); }
  }, [slug]);

  // Muat ulang saat episode berganti atau status login berubah (supaya tombol hapus akurat).
  useEffect(() => { if (status !== 'loading') void load(); }, [load, status]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t || sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, text: t }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(j.message ?? 'Komentar gagal dikirim.'); return; }
      setItems((prev) => [j.comment, ...prev]); setMeUid(j.comment.uid); setText('');
    } catch { toast.error('Tidak dapat terhubung ke server.'); }
    finally { setSending(false); }
  };

  const remove = async (id: string) => {
    const old = items;
    setItems((p) => p.filter((c) => c.id !== id));
    try {
      const r = await fetch(`/api/comments?slug=${encodeURIComponent(slug)}&id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!r.ok) throw new Error();
    } catch { setItems(old); toast.error('Gagal menghapus komentar.'); }
  };

  const user = session?.user;

  return (
    <section aria-label="Komentar">
      {!persistent && (
        <p className="mb-3 rounded border-2 border-black bg-gold/20 px-3 py-2 text-xs font-semibold">
          Mode demo: database komentar belum dihubungkan, jadi komentar tidak permanen.
        </p>
      )}

      {status === 'loading' ? null : user ? (
        <form onSubmit={submit} className="card-brutal mb-4 p-3">
          <div className="flex gap-3">
            <Avatar name={user.name ?? user.email ?? '?'} image={user.image ?? ''} />
            <div className="min-w-0 flex-1">
              <textarea
                value={text} onChange={(e) => setText(e.target.value.slice(0, MAX))} rows={3} maxLength={MAX}
                placeholder="Tulis komentar…"
                className="w-full resize-y rounded border-2 border-black bg-surface-2 p-2.5 text-sm font-medium outline-none placeholder:text-muted focus:bg-bg"
              />
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-xs text-muted">{text.length}/{MAX}</span>
                <button type="submit" disabled={!text.trim() || sending} className="btn-primary !py-2">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Kirim
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="card-brutal mb-4 flex flex-col items-start gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">Login dulu untuk menulis komentar.</p>
          <button data-no-ad onClick={() => signIn('google', { callbackUrl: window.location.href })} className="btn-primary"><LogIn size={16} /> Login dengan Google</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 w-full rounded" />)}</div>
      ) : error ? (
        <div className="card-brutal p-4 text-center text-sm">
          <p className="mb-3 font-semibold">{error}</p>
          <button onClick={() => void load()} className="btn-secondary">Coba lagi</button>
        </div>
      ) : items.length === 0 ? (
        <div className="card-brutal grid place-items-center gap-2 p-8 text-center text-sm text-muted">
          <MessageSquare size={28} className="text-gold" />
          Belum ada komentar. Jadilah yang pertama!
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id} className="card-brutal flex gap-3 p-3">
              <Avatar name={c.name} image={c.image} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-extrabold">{c.name}</span>
                  <span className="shrink-0 text-xs text-muted">{timeAgo(c.ts)}</span>
                  {meUid && c.uid === meUid && (
                    <button onClick={() => void remove(c.id)} aria-label="Hapus komentar" className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded border-2 border-transparent text-muted transition hover:border-black hover:bg-gold hover:text-black">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{c.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
