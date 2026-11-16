// Penyimpanan komentar (server saja).
// - Produksi: Upstash Redis lewat REST (tanpa paket tambahan). Di Vercel: Marketplace → Upstash Redis / KV,
//   env UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (atau KV_REST_API_URL + KV_REST_API_TOKEN).
// - Tanpa env: memori proses (hanya untuk dev/demo; hilang saat restart & tidak dibagi antar instance serverless).

export interface Comment { id: string; uid: string; name: string; image: string; text: string; ts: number }

const REST_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
export const persistent = Boolean(REST_URL && REST_TOKEN);

const KEEP = 200;   // komentar tersimpan per episode
const LIMIT = 50;   // komentar ditampilkan

export async function redis(cmd: (string | number)[]): Promise<any> {
  const res = await fetch(REST_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const j = await res.json();
  if (j.error) throw new Error(String(j.error));
  return j.result;
}

/** Banyak perintah dalam satu request (hemat kuota). */
export async function redisPipeline(cmds: (string | number)[][]): Promise<any[]> {
  const res = await fetch(`${REST_URL.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REST_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`redis ${res.status}`);
  const j = (await res.json()) as { result?: unknown; error?: string }[];
  return j.map((x) => {
    if (x.error) throw new Error(String(x.error));
    return x.result;
  });
}

const g = globalThis as unknown as { __dwComments?: Map<string, Comment[]>; __dwRate?: Map<string, number> };
const mem = () => (g.__dwComments ??= new Map());
const rate = () => (g.__dwRate ??= new Map());
const key = (slug: string) => `dw:comments:${slug}`;

const parse = (raw: unknown): Comment | null => {
  try { const c = JSON.parse(String(raw)); return c && typeof c.id === 'string' ? (c as Comment) : null; } catch { return null; }
};

export async function listComments(slug: string): Promise<Comment[]> {
  if (!persistent) return (mem().get(key(slug)) ?? ([] as Comment[])).slice(0, LIMIT);
  const raw: string[] = (await redis(['LRANGE', key(slug), 0, LIMIT - 1])) ?? [];
  return raw.map(parse).filter((c): c is Comment => c !== null);
}

export async function addComment(slug: string, c: Comment): Promise<void> {
  if (!persistent) {
    const arr: Comment[] = mem().get(key(slug)) ?? [];
    mem().set(key(slug), [c, ...arr].slice(0, KEEP));
    return;
  }
  await redis(['LPUSH', key(slug), JSON.stringify(c)]);
  await redis(['LTRIM', key(slug), 0, KEEP - 1]);
}

export async function removeComment(slug: string, id: string, uid: string): Promise<boolean> {
  if (!persistent) {
    const arr: Comment[] = mem().get(key(slug)) ?? [];
    const next = arr.filter((c) => !(c.id === id && c.uid === uid));
    mem().set(key(slug), next);
    return next.length !== arr.length;
  }
  const raw: string[] = (await redis(['LRANGE', key(slug), 0, KEEP - 1])) ?? [];
  const hit = raw.find((r) => { const c = parse(r); return c && c.id === id && c.uid === uid; });
  if (!hit) return false;
  await redis(['LREM', key(slug), 1, hit]);
  return true;
}

/** true = boleh; false = terlalu cepat. Satu komentar per `seconds` per pengguna. */
export async function allowAction(uid: string, seconds = 10): Promise<boolean> {
  if (!persistent) {
    const now = Date.now(), last = rate().get(uid) ?? 0;
    if (now - last < seconds * 1000) return false;
    rate().set(uid, now);
    return true;
  }
  const r = await redis(['SET', `dw:rl:${uid}`, '1', 'EX', seconds, 'NX']);
  return r === 'OK';
}
