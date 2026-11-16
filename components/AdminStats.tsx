'use client';
import { useEffect, useState } from 'react';
import { Activity, CalendarDays, CalendarRange, Clock } from 'lucide-react';

interface Stats { online: number; hour: number; day: number; month: number; persistent: boolean }
const n = (v: number) => v.toLocaleString('id-ID');

export default function AdminStats() {
  const [s, setS] = useState<Stats | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    let off = false;
    const load = async () => {
      try {
        const r = await fetch('/api/admin/stats', { cache: 'no-store' });
        if (!r.ok) throw new Error();
        const j = (await r.json()) as Stats;
        if (!off) { setS(j); setErr(false); }
      } catch { if (!off) setErr(true); }
    };
    void load();
    const id = setInterval(load, 30_000); // segarkan tiap 30 detik
    return () => { off = true; clearInterval(id); };
  }, []);

  const cards = [
    { label: 'Aktif 10 menit terakhir', value: s?.online, icon: Activity },
    { label: '1 jam terakhir', value: s?.hour, icon: Clock },
    { label: '24 jam terakhir', value: s?.day, icon: CalendarDays },
    { label: '30 hari terakhir', value: s?.month, icon: CalendarRange },
  ];

  return (
    <div>
      {err && <p className="mb-2 text-sm font-semibold">Statistik gagal dimuat.</p>}
      {s && !s.persistent && (
        <p className="mb-3 rounded border-2 border-black bg-gold/20 px-3 py-2 text-xs font-semibold">
          Mode demo: database belum terhubung, jadi angka hanya dari memori server dan akan hilang saat restart.
        </p>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card-brutal p-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs font-bold text-muted"><Icon size={15} className="text-gold" /> {label}</div>
            <p className="mt-2 font-heading text-3xl font-extrabold">{value === undefined ? <span className="skeleton inline-block h-8 w-16 rounded" /> : n(value)}</p>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">Pengunjung unik per browser. Satu orang dengan dua perangkat terhitung dua; kunjungan ulang dalam jendela yang sama tidak dihitung dua kali.</p>
    </div>
  );
}
