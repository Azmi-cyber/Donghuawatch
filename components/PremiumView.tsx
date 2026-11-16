'use client';
import { signIn, useSession } from 'next-auth/react';
import { BadgeCheck, Crown, LogIn, MessageCircle, ShieldOff } from 'lucide-react';
import { usePremium } from '@/lib/usePremium';
import { PLANS, rupiah, WA_NUMBER, type Plan } from '@/lib/premium';

const fmtDate = (ts: number) => new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

function waLink(plan: Plan, email: string) {
  const text = `Halo admin, saya mau beli Premium DonghuaWatch.\nPaket: ${plan.label} (${rupiah(plan.price)})\nEmail Google akun saya: ${email}`;
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

export default function PremiumView() {
  const { data: session, status } = useSession();
  const { ready, premium, until, admin } = usePremium();
  const email = session?.user?.email ?? '';

  return (
    <div className="container-x max-w-4xl py-8">
      <div className="card-brutal bg-gold p-5 text-black sm:p-7">
        <div className="flex items-center gap-3">
          <Crown size={30} />
          <h1 className="font-heading text-2xl font-extrabold sm:text-3xl">DonghuaWatch Premium</h1>
        </div>
        <p className="mt-2 flex items-center gap-2 text-sm font-bold sm:text-base"><ShieldOff size={18} /> Nonton tanpa iklan, tanpa pop-up, tanpa redirect.</p>
      </div>

      {/* Status akun */}
      <div className="card-brutal mt-5 p-4">
        {status === 'loading' || (email && !ready) ? (
          <div className="skeleton h-6 w-1/2 rounded" />
        ) : !email ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold">Login dulu agar Premium dipasang ke akun Google kamu.</p>
            <button data-no-ad onClick={() => signIn('google', { callbackUrl: window.location.href })} className="btn-primary"><LogIn size={16} /> Login dengan Google</button>
          </div>
        ) : premium ? (
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold"><BadgeCheck className="text-gold" size={20} /> Premium aktif sampai {fmtDate(until)} <span className="font-medium text-muted">({email})</span></p>
        ) : (
          <p className="text-sm font-semibold">Akun <span className="text-gold">{email}</span> belum Premium.</p>
        )}
        {admin && <a data-no-ad href="/admin/premium" className="btn-secondary mt-3 !py-1.5 text-xs">Buka panel admin</a>}
      </div>

      {/* Paket */}
      <h2 className="mt-8 font-heading text-xl font-extrabold">Pilih Paket</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((p) => (
          <div key={p.id} className="card-brutal flex flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-heading text-lg font-extrabold">{p.label}</h3>
              {p.save && <span className="badge">{p.save}</span>}
            </div>
            <p className="mt-2 font-heading text-3xl font-extrabold text-gold">{rupiah(p.price)}</p>
            <p className="text-xs text-muted">≈ {rupiah(Math.round(p.price / p.days))} / hari</p>
            {email ? (
              <a data-no-ad href={waLink(p, email)} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4">
                <MessageCircle size={16} /> Beli via WhatsApp
              </a>
            ) : (
              <button data-no-ad onClick={() => signIn('google', { callbackUrl: window.location.href })} className="btn-secondary mt-4">
                <LogIn size={16} /> Login untuk membeli
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Tutorial */}
      <h2 className="mt-8 font-heading text-xl font-extrabold">Cara Beli</h2>
      <ol className="card-brutal mt-3 space-y-3 p-4 text-sm">
        {[
          'Login dengan akun Google yang ingin dijadikan Premium.',
          'Pilih paket, lalu tekan "Beli via WhatsApp". Pesan berisi paket dan email kamu terisi otomatis.',
          'Kirim pesannya ke admin dan ikuti instruksi pembayaran.',
          'Setelah pembayaran dikonfirmasi, admin mengaktifkan Premium ke email kamu.',
          'Muat ulang halaman ini. Status berubah menjadi "Premium aktif" dan iklan hilang.',
        ].map((t, i) => (
          <li key={i} className="flex gap-3">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded border-2 border-black bg-gold text-sm font-extrabold text-black">{i + 1}</span>
            <span className="pt-0.5 font-medium">{t}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-xs text-muted">Beli perpanjangan sebelum masa habis? Durasi baru otomatis disambung dari tanggal berakhir.</p>
    </div>
  );
}
