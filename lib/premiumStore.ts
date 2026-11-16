// Data premium (server saja). Memakai Upstash yang sama dengan komentar; tanpa env → memori (demo).
import { persistent, redis } from './commentStore';
import { normEmail } from './premium';

export interface PremiumRow { email: string; until: number }

const g = globalThis as unknown as { __dwPremium?: Map<string, number> };
const mem = (): Map<string, number> => (g.__dwPremium ??= new Map<string, number>());
const k = (e: string) => `dw:premium:${e}`;
const INDEX = 'dw:premium:index';
const DAY = 86_400_000;

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS ?? '').split(',').map((x: string) => normEmail(x)).filter(Boolean);
  return list.includes(normEmail(email));
}

export async function getPremiumUntil(email: string): Promise<number> {
  const e = normEmail(email);
  if (!persistent) return mem().get(e) ?? 0;
  const n = Number(await redis(['GET', k(e)]));
  return Number.isFinite(n) ? n : 0;
}

/** Tambah durasi. Kalau masih aktif, durasi baru disambung dari tanggal habis. */
export async function addPremium(email: string, days: number): Promise<number> {
  const e = normEmail(email);
  const until = Math.max(Date.now(), await getPremiumUntil(e)) + days * DAY;
  if (!persistent) mem().set(e, until);
  else { await redis(['SET', k(e), String(until)]); await redis(['SADD', INDEX, e]); }
  return until;
}

export async function removePremium(email: string): Promise<void> {
  const e = normEmail(email);
  if (!persistent) { mem().delete(e); return; }
  await redis(['DEL', k(e)]);
  await redis(['SREM', INDEX, e]);
}

export async function listPremium(): Promise<PremiumRow[]> {
  let rows: PremiumRow[];
  if (!persistent) {
    rows = Array.from(mem().entries()).map(([email, until]: [string, number]) => ({ email, until }));
  } else {
    const emails: string[] = (await redis(['SMEMBERS', INDEX])) ?? [];
    if (!emails.length) return [];
    const vals: (string | null)[] = await redis(['MGET', ...emails.map(k)]);
    rows = emails.map((email: string, i: number) => ({ email, until: Number(vals[i]) || 0 }));
  }
  return rows.sort((a: PremiumRow, b: PremiumRow) => b.until - a.until);
}
