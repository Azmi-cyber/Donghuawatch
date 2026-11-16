// Konfigurasi premium (dipakai server & client). UBAH HARGA/NOMOR DI SINI.
export const WA_NUMBER = '628217926668'; // +62 821-7926-668

export interface Plan { id: string; label: string; days: number; price: number; save?: string }
export const PLANS: Plan[] = [
  { id: '5d', label: '5 Hari', days: 5, price: 3000 },
  { id: '1m', label: '1 Bulan', days: 30, price: 10000 },
  { id: '3m', label: '3 Bulan', days: 90, price: 25000, save: 'Hemat 17%' },
  { id: '6m', label: '6 Bulan', days: 180, price: 45000, save: 'Hemat 25%' },
  { id: '1y', label: '1 Tahun', days: 365, price: 80000, save: 'Hemat 33%' },
];
export const rupiah = (n: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(n);

/** Gmail mengabaikan titik & "+tag", jadi disamakan agar akun yang sama selalu cocok. */
export function normEmail(raw: string): string {
  const e = (raw ?? '').trim().toLowerCase();
  const at = e.lastIndexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at), domain = e.slice(at + 1);
  if (domain === 'gmail.com' || domain === 'googlemail.com') { domain = 'gmail.com'; local = local.split('+')[0].replace(/\./g, ''); }
  return `${local}@${domain}`;
}
export const isEmail = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
