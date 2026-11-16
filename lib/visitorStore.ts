// Statistik pengunjung UNIK (server saja).
// Tiap pengunjung punya ID acak di browser. Disimpan di Redis HyperLogLog per jendela waktu
// (menit / jam / hari, zona WIB). HyperLogLog hanya menyimpan hash, jadi ID tidak bisa dibaca kembali.
// Tanpa Upstash: dihitung di memori server (demo).
import { persistent, redisPipeline } from './commentStore';

type Unit = 'm' | 'h' | 'd';
const OFFSET = 7 * 3_600_000; // WIB
const STEP: Record<Unit, number> = { m: 60_000, h: 3_600_000, d: 86_400_000 };
const TTL: Record<Unit, number> = { m: 7_200, h: 172_800, d: 3_024_000 };

const pad = (n: number) => String(n).padStart(2, '0');
function keyAt(unit: Unit, t: number): string {
  const d = new Date(t + OFFSET);
  const day = `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
  const hour = day + pad(d.getUTCHours());
  const stamp = unit === 'd' ? day : unit === 'h' ? hour : hour + pad(d.getUTCMinutes());
  return `dw:v:${unit}:${stamp}`;
}
const keys = (unit: Unit, count: number, now: number): string[] =>
  Array.from({ length: count }, (_, i) => keyAt(unit, now - i * STEP[unit]));

const g = globalThis as unknown as { __dwVisits?: Map<string, Set<string>> };
const mem = (): Map<string, Set<string>> => (g.__dwVisits ??= new Map<string, Set<string>>());

export async function recordVisit(vid: string): Promise<void> {
  const now = Date.now();
  const units: Unit[] = ['m', 'h', 'd'];
  if (!persistent) {
    for (const u of units) {
      const k = keyAt(u, now);
      let set = mem().get(k);
      if (!set) { set = new Set<string>(); mem().set(k, set); }
      set.add(vid);
    }
    if (mem().size > 3000) {
      const it = mem().keys();
      for (let i = 0; i < 500; i++) { const k = it.next().value; if (k) mem().delete(k); }
    }
    return;
  }
  const cmds: (string | number)[][] = [];
  for (const u of units) {
    const k = keyAt(u, now);
    cmds.push(['PFADD', k, vid], ['EXPIRE', k, TTL[u]]);
  }
  await redisPipeline(cmds);
}

export interface VisitorStats { online: number; hour: number; day: number; month: number; persistent: boolean }

export async function getStats(): Promise<VisitorStats> {
  const now = Date.now();
  const groups: string[][] = [keys('m', 10, now), keys('m', 60, now), keys('h', 24, now), keys('d', 30, now)];
  let counts: number[];
  if (!persistent) {
    counts = groups.map((ks: string[]) => {
      const uniq = new Set<string>();
      ks.forEach((k: string) => mem().get(k)?.forEach((v: string) => uniq.add(v)));
      return uniq.size;
    });
  } else {
    const res = await redisPipeline(groups.map((ks: string[]) => ['PFCOUNT', ...ks]));
    counts = res.map((x: unknown) => Number(x) || 0);
  }
  return { online: counts[0], hour: counts[1], day: counts[2], month: counts[3], persistent };
}
