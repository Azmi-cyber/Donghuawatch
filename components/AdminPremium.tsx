'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Loader2, LogIn, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { PLANS } from '@/lib/premium';
import AdminStats from './AdminStats';

interface Row { email: string; until: number }
const fmt = (ts: number) => new Date(ts).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function AdminPremium() {
  const { status } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [state, setState] = useState<'loading' | 'ok' | 'denied' | 'error'>('loading');
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState(PLANS[1].id);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const r = await fetch('/api/admin/premium', { cache: 'no-store' });
      if (r.status === 403) { setState('denied'); return; }
      if (!r.ok) throw new Error();
      setRows((await r.json()).rows ?? []); setState('ok');
    } catch { setState('error'); }
  }, []);

  useEffect(() => { if (status === 'authenticated') void load(); else if (status === 'unauthenticated') setState('denied'); }, [status, load]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    try {
      const r = await fetch('/api/admin/premium', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, plan }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) { toast.error(j.message ?? 'Gagal.'); return; }
      toast.success(`Premium aktif sampai ${fmt(j.until)}`); setEmail(''); await load();
    } catch { toast.error('Tidak dapat terhubung.'); } finally { setBusy(false); }
  };

  const revoke = async (em: string) => {
    if (!confirm(`Cabut Premium ${em}?`)) return;
    const r = await fetch(`/api/admin/premium?email=${encodeURIComponent(em)}`, { method: 'DELETE' });
    if (r.ok) { toast.success('Premium dicabut'); await load(); } else toast.error('Gagal mencabut.');
  };

  if (state === 'loading' || status === 'loading') return <div className="container-x py-10"><div className="skeleton h-40 rounded" /></div>;
  if (state === 'denied') {
    return (
      <div className="container-x max-w-md py-12">
        <div className="card-brutal p-6 text-center">
          <p className="font-extrabold">Akses ditolak</p>
          <p className="mt-1 text-sm text-muted">Halaman ini hanya untuk admin (email di env <code>ADMIN_EMAILS</code>).</p>
          {status === 'unauthenticated' && <button data-no-ad onClick={() => signIn('google', { callbackUrl: window.location.href })} className="btn-primary mt-4"><LogIn size={16} /> Login</button>}
        </div>
      </div>
    );
  }
  if (state === 'error') return <div className="container-x py-12 text-center"><p className="mb-3 font-semibold">Gagal memuat data.</p><button onClick={() => void load()} className="btn-secondary">Coba lagi</button></div>;

  const now = Date.now();
  return (
    <div className="container-x max-w-3xl py-8">
      <h1 className="font-heading text-2xl font-extrabold">Admin</h1>

      <h2 className="mb-3 mt-5 font-heading text-lg font-extrabold">Statistik Pengunjung</h2>
      <AdminStats />

      <h2 className="mt-8 font-heading text-lg font-extrabold">Premium</h2>

      <form onSubmit={add} className="card-brutal mt-4 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@gmail.com"
          className="min-w-0 rounded border-2 border-black bg-surface-2 px-3 py-2.5 text-sm font-medium outline-none placeholder:text-muted focus:bg-bg" />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="rounded border-2 border-black bg-surface-2 px-3 py-2.5 text-sm font-bold outline-none">
          {PLANS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        <button disabled={busy} className="btn-primary">{busy ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Tambah</button>
      </form>
      <p className="mt-2 text-xs text-muted">Kalau email sudah Premium, durasi baru disambung dari tanggal habisnya.</p>

      <h2 className="mt-6 font-heading text-lg font-extrabold">Akun Premium ({rows.length})</h2>
      {rows.length === 0 ? <p className="mt-2 text-sm text-muted">Belum ada.</p> : (
        <ul className="mt-3 space-y-2">
          {rows.map((r) => {
            const active = r.until > now;
            const left = Math.max(0, Math.ceil((r.until - now) / 86_400_000));
            return (
              <li key={r.email} className="card-brutal flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-extrabold">{r.email}</p>
                  <p className="text-xs text-muted">sampai {fmt(r.until)}{active ? ` · ${left} hari lagi` : ''}</p>
                </div>
                <span className={active ? 'badge' : 'badge !bg-surface-2 !text-ink'}>{active ? 'Aktif' : 'Habis'}</span>
                <button onClick={() => void revoke(r.email)} aria-label="Cabut" className="grid h-9 w-9 shrink-0 place-items-center rounded border-2 border-black bg-surface-2 shadow-brutal-sm transition hover:bg-gold hover:text-black active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"><Trash2 size={16} /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
