/**
 * Semua request client → /api/proxy/* (tidak pernah langsung ke API eksternal).
 * Setiap fungsi mengembalikan data yang sudah di-parse (lihat lib/parse.ts).
 */
import {
  parseDetail, parseEpisodePage, parseGenreList, parseHome, parseList, parseSchedule,
} from './parse';
import { seriesSlugFromEpisode } from './parse';
import type { Detail, ListResult } from './types';
import { humanize } from './utils';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const toApiError = (e: unknown): ApiError =>
  e instanceof ApiError ? e : new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internetmu.', 0);

async function fetchJson(path: string): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(`/api/proxy${path}`);
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Periksa koneksi internetmu.', 0);
  }
  if (!res.ok) {
    let msg = `Gagal memuat data (${res.status}).`;
    try {
      const j = await res.json();
      if (j?.message) msg = j.message;
    } catch {}
    throw new ApiError(msg, res.status);
  }
  try {
    return await res.json();
  } catch {
    throw new ApiError('Respons server tidak valid.', 502);
  }
}

// Cache di memori browser (3 menit) + dedupe request yang sama → pindah halaman terasa instan.
const TTL = 3 * 60_000;
const cache = new Map<string, { t: number; p: Promise<unknown> }>();
function get(path: string): Promise<unknown> {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.t < TTL) return hit.p;
  const p = fetchJson(path);
  cache.set(path, { t: Date.now(), p });
  p.catch(() => cache.delete(path));
  if (cache.size > 120) cache.delete(cache.keys().next().value as string);
  return p;
}

const enc = encodeURIComponent;
const list = async (path: string, page: number): Promise<ListResult> => parseList(await get(path), page);

export const api = {
  home: async (page = 1) => parseHome(await get(`/donghua/home/${page}`)),
  ongoing: (page = 1) => list(`/donghua/ongoing/${page}`, page),
  completed: (page = 1) => list(`/donghua/completed/${page}`, page),
  latest: (page = 1) => list(`/donghua/latest/${page}`, page),
  schedule: async () => parseSchedule(await get('/donghua/schedule')),
  az: (letter: string, page = 1) => list(`/donghua/az-list/${enc(letter)}/${page}`, page),
  search: (keyword: string, page = 1) => list(`/donghua/search/${enc(keyword)}/${page}`, page),
  detail: async (slug: string) => parseDetail(await get(`/donghua/detail/${enc(slug)}`)),
  episode: async (slug: string) => parseEpisodePage(await get(`/donghua/episode/${enc(slug)}`)),
  genres: async () => parseGenreList(await get('/donghua/genres')),
  byGenre: (slug: string, page = 1) => list(`/donghua/genres/${enc(slug)}/${page}`, page),
  season: (year?: string, page = 1) => list(year ? `/donghua/seasons/${enc(year)}` : '/donghua/seasons', page),
};

export const rawGet = get;

/** Panggil saat hover/touch kartu: data halaman tujuan dimuat duluan. */
export function prefetchHref(href: string) {
  try {
    if (href.startsWith('/donghua/')) void api.detail(decodeURIComponent(href.slice(9))).catch(() => {});
    else if (href.startsWith('/watch/')) void api.episode(decodeURIComponent(href.slice(7))).catch(() => {});
  } catch {}
}

const EP_RE = /-episode-\d+|-eps?-\d+/i;
export const cleanEpisodeTitle = (t: string) =>
  t.replace(/\s*[-–]?\s*(episode|eps?)\s*\d+.*$/i, '').replace(/\s*subtitle indonesia.*$/i, '').trim();

// ───────────── Alias slug ─────────────
// Slug series di sumber data sering berubah (akhiran sub-indo, kode acak, dsb).
// Slug lama → slug yang terbukti berhasil disimpan di browser, jadi kunjungan berikutnya langsung tepat.
const ALIAS_KEY = 'dw:alias';
const readAlias = (): Record<string, string> => {
  try { return JSON.parse(localStorage.getItem(ALIAS_KEY) || '{}'); } catch { return {}; }
};
export function saveAlias(from: string, to: string) {
  if (typeof window === 'undefined' || !from || !to || from === to) return;
  try {
    const a = readAlias();
    a[from] = to;
    const keys = Object.keys(a);
    if (keys.length > 300) delete a[keys[0]];
    localStorage.setItem(ALIAS_KEY, JSON.stringify(a));
  } catch {}
}
const getAlias = (slug: string): string | undefined => (typeof window === 'undefined' ? undefined : readAlias()[slug]);

const safeDecode = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };
const NOISE_SUFFIX = /-(subtitle-indonesia|sub-indonesia|sub-indo|subtitle|indo)$/i;
const HASH_SUFFIX = /-(?=[a-z0-9]*\d)(?=[a-z0-9]*[a-z])[a-z0-9]{4,10}$/i; // mis. "-a1b2c3"
const YEAR_SUFFIX = /-(19|20)\d{2}$/;
const STOP = new Set(['sub', 'indo', 'subtitle', 'indonesia', 'episode', 'eps', 'ep', 'season', 'the', 'of']);

/** Varian slug yang mungkin: tanpa akhiran sub-indo, tanpa kode acak, tanpa tahun. */
function slugVariants(slug: string): string[] {
  const base = safeDecode(slug).toLowerCase();
  const out = new Set<string>();
  const add = (v: string) => { if (v && v !== slug) out.add(v); };
  let t = base;
  for (let i = 0; i < 3; i++) {
    const n = t.replace(NOISE_SUFFIX, '').replace(HASH_SUFFIX, '').replace(YEAR_SUFFIX, '');
    if (n === t) break;
    t = n;
    add(t);
  }
  add(base.replace(NOISE_SUFFIX, ''));
  add(base.replace(HASH_SUFFIX, ''));
  return [...out];
}

const tokens = (s: string): Set<string> =>
  new Set(
    safeDecode(s).toLowerCase().split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1 && !STOP.has(w) && !(/\d/.test(w) && /[a-z]/.test(w) && w.length >= 5)),
  );
const similarity = (a: Set<string>, b: Set<string>) => {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((w) => { if (b.has(w)) inter++; });
  return inter / (a.size + b.size - inter);
};

/**
 * Ambil detail donghua dengan beberapa lapis fallback (berhenti di yang pertama berhasil):
 * 0) alias tersimpan  1) slug apa adanya  2) varian slug (tanpa sub-indo / kode acak / tahun)
 * 3) bila slug episode → slug series dari respons episode / potong "-episode-N"
 * 4) cari lewat judul, urutkan hasil berdasarkan kemiripan, coba 4 teratas.
 * Slug yang berhasil disimpan sebagai alias supaya URL lama tetap terbuka.
 */
export async function smartDetail(slug: string, hint?: { seriesTitle?: string; title?: string }): Promise<{ detail: Detail; slug: string }> {
  const tried = new Set<string>();
  const attempt = async (s: string) => {
    if (!s || tried.has(s)) return null;
    tried.add(s);
    try {
      const d = await api.detail(s);
      return d.title || d.episodes.length ? { detail: d, slug: s } : null;
    } catch { return null; }
  };
  const done = (r: { detail: Detail; slug: string }) => { saveAlias(slug, r.slug); return r; };

  const alias = getAlias(slug);
  if (alias) { const r = await attempt(alias); if (r) return r; }

  const first = await attempt(slug);
  if (first) return first;

  for (const v of slugVariants(slug)) { const r = await attempt(v); if (r) return done(r); }

  const epLike = EP_RE.test(slug);
  let title = hint?.seriesTitle || (hint?.title ? cleanEpisodeTitle(hint.title) : '');
  const cands: string[] = [];
  if (epLike) {
    const ep = await api.episode(slug).catch(() => null);
    if (ep) { cands.push(ep.seriesSlug); title = title || ep.seriesTitle || cleanEpisodeTitle(ep.title); }
    cands.push(seriesSlugFromEpisode(slug));
  }
  for (const c of cands) {
    for (const v of [c, ...slugVariants(c)]) { const r = await attempt(v); if (r) return done(r); }
  }

  const baseSlug = epLike ? seriesSlugFromEpisode(slug) : slug;
  const base = (title || humanize(baseSlug.replace(NOISE_SUFFIX, '').replace(HASH_SUFFIX, ''))).trim();
  const want = tokens(`${base} ${baseSlug}`);
  const noSeason = base.replace(/\bseason\s*\d+/i, '').trim();
  const firstWords = base.split(/\s+/).slice(0, 3).join(' ');
  const queries = [...new Set([base, noSeason, firstWords].filter((q) => q.length > 1))];

  for (const q of queries) {
    try {
      const res = await api.search(q, 1);
      const ranked = res.items
        .filter((x) => !EP_RE.test(x.slug))
        .map((x) => ({ x, score: Math.max(similarity(want, tokens(x.slug)), similarity(want, tokens(x.title))) }))
        .filter((r) => r.score >= 0.34)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);
      for (const { x } of ranked) { const r = await attempt(x.slug); if (r) return done(r); }
    } catch {}
  }
  throw new ApiError('Detail donghua tidak ditemukan di sumber data.', 404);
}
