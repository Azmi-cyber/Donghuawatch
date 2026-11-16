/**
 * Parser defensif. Bentuk JSON API asli belum diketahui, jadi setiap field dicoba
 * dari beberapa nama kunci. Kalau response asli berbeda, cukup tambah nama kunci
 * di array-array di bawah ini (semua penyesuaian ada di file ini).
 */
import type {
  Detail, DownloadGroup, DownloadLink, EpisodePage, EpisodeRef, Genre, HomeData,
  Item, ListResult, PageInfo, ScheduleDay, Stream,
} from './types';
import { slugify } from './utils';

type AnyObj = Record<string, any>;

export const isObj = (v: unknown): v is AnyObj => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Ambil nilai pertama yang tidak kosong dari daftar kunci. */
export function pick(o: unknown, keys: string[]): any {
  if (!isObj(o)) return undefined;
  for (const k of keys) {
    const v = o[k];
    if (v !== undefined && v !== null && v !== '') return v;
  }
  return undefined;
}

export function str(v: any, depth = 0): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string') return v.replace(/\s+/g, ' ').trim();
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map((x) => str(x, depth + 1)).filter(Boolean).join(', ');
  if (isObj(v) && depth < 2) return str(pick(v, ['name', 'title', 'text', 'label', 'value', 'slug']), depth + 1);
  return '';
}

const num = (v: any): number | undefined => {
  if (v === undefined || v === null || v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export function slugFromUrl(u: any): string {
  const s = str(u);
  if (!s) return '';
  const seg = s.split('#')[0].split('?')[0].replace(/\/+$/, '').split('/').filter(Boolean);
  return seg[seg.length - 1] ?? '';
}

export const seriesSlugFromEpisode = (slug: string) => slug.replace(/-?(episode|eps?)-\d+.*$/i, '') || slug;

/** Gabungkan wrapper umum ({data:{...}}, {detail:{...}}, {info:{...}}) jadi satu objek datar. */
export function flatten(data: unknown, depth = 0): AnyObj {
  if (!isObj(data)) return {};
  let out: AnyObj = { ...data };
  if (depth < 3) {
    for (const k of ['data', 'result', 'detail', 'details', 'info']) {
      if (isObj(data[k])) out = { ...out, ...flatten(data[k], depth + 1) };
    }
  }
  return out;
}

const WRAP = ['data', 'results', 'result', 'items', 'list', 'donghua', 'anime', 'series', 'content'];

function search(d: unknown, keys: string[], depth: number, arrWrap: boolean): AnyObj[] | null {
  if (depth > 4 || d === null || d === undefined) return null;
  if (Array.isArray(d)) {
    const a = d.filter(isObj);
    return a.length ? a : null;
  }
  if (!isObj(d)) return null;
  for (const k of keys) {
    if (k in d) {
      const r = search(d[k], keys, depth + 1, true);
      if (r) return r;
    }
  }
  for (const k of WRAP) {
    const v = d[k];
    if (v === undefined || v === null) continue;
    if (Array.isArray(v) && !arrWrap) continue;
    const r = search(v, keys, depth + 1, arrWrap);
    if (r) return r;
  }
  return null;
}

function largestArray(d: unknown, depth = 0): AnyObj[] {
  if (depth > 4) return [];
  if (Array.isArray(d)) {
    const a = d.filter(isObj);
    if (a.length) return a;
    return [];
  }
  if (!isObj(d)) return [];
  let best: AnyObj[] = [];
  for (const v of Object.values(d)) {
    const r = largestArray(v, depth + 1);
    if (r.length > best.length) best = r;
  }
  return best;
}

/**
 * Cari array of object. Urutan: kunci yang disebut -> wrapper umum -> (opsional) array terpanjang.
 * fallback=false → strict: hanya kembalikan kalau salah satu kunci cocok.
 */
export function findArray(data: unknown, keys: string[] = [], fallback = true): AnyObj[] {
  const r = search(data, keys, 0, fallback || keys.length === 0);
  if (r) return r;
  return fallback ? largestArray(data) : [];
}

// ───────────────────────── Genre ─────────────────────────
export function parseGenres(raw: any): Genre[] {
  const arr: any[] = Array.isArray(raw) ? raw : isObj(raw) ? [raw] : typeof raw === 'string' ? raw.split(',') : [];
  const out: Genre[] = [];
  for (const g of arr) {
    if (typeof g === 'string') {
      const name = g.trim();
      if (name) out.push({ name, slug: slugify(name) });
      continue;
    }
    if (!isObj(g)) continue;
    const name = str(pick(g, ['name', 'title', 'genre', 'label']));
    const slug = str(pick(g, ['slug', 'id'])) || slugFromUrl(pick(g, ['url', 'href', 'link', 'endpoint'])) || slugify(name);
    if (name && slug) out.push({ name, slug });
  }
  return out;
}

export function parseGenreList(data: unknown): Genre[] {
  const f = flatten(data);
  const raw =
    pick(f, ['genres', 'genre', 'list', 'items']) ??
    (Array.isArray(data) ? data : Array.isArray((data as AnyObj)?.data) ? (data as AnyObj).data : findArray(data));
  return parseGenres(raw);
}

// ───────────────────────── Item / List ─────────────────────────
export function normalizeItem(raw: AnyObj): Item | null {
  const title = str(pick(raw, ['title', 'name', 'judul', 'series_title', 'donghua_title']));
  const url = str(pick(raw, ['url', 'href', 'link', 'endpoint', 'episode_url']));
  let slug = str(pick(raw, ['slug', 'id', 'series_slug', 'donghua_slug'])) || slugFromUrl(url);
  if (slug.includes('/')) slug = slugFromUrl(slug);
  if (!title && !slug) return null;

  const episodeSlug =
    str(pick(raw, ['episode_slug', 'latest_episode_slug'])) ||
    (/\/episode\//i.test(url) || /-episode-\d+/i.test(slug) ? slug : '');
  const seriesSlug = episodeSlug && episodeSlug === slug ? seriesSlugFromEpisode(slug) : slug;

  const epRaw = str(pick(raw, ['episode', 'current_episode', 'latest_episode', 'episode_number', 'eps', 'ep', 'chapter']));
  const episode = /^\d+(\.\d+)?$/.test(epRaw) ? `Ep ${epRaw}` : epRaw;

  return {
    slug: seriesSlug || slug,
    title: title || slug.replace(/-/g, ' '),
    poster: str(pick(raw, ['poster', 'image', 'thumbnail', 'cover', 'img', 'thumb', 'poster_url', 'image_url'])),
    href: episodeSlug ? `/watch/${episodeSlug}` : `/donghua/${seriesSlug || slug}`,
    episode: episode || undefined,
    episodeSlug: episodeSlug || undefined,
    status: str(pick(raw, ['status', 'state'])) || undefined,
    type: str(pick(raw, ['type', 'format'])) || undefined,
    rating: str(pick(raw, ['rating', 'score'])) || undefined,
    year: str(pick(raw, ['year', 'release_year', 'released', 'season'])) || undefined,
    time: str(pick(raw, ['time', 'release_time', 'jam', 'airing_time'])) || undefined,
    synopsis: str(pick(raw, ['synopsis', 'sinopsis', 'description', 'desc'])) || undefined,
    genres: parseGenres(pick(raw, ['genres', 'genre'])),
  };
}

export const normalizeItems = (arr: AnyObj[]): Item[] =>
  arr.map(normalizeItem).filter((x): x is Item => x !== null);

export function parsePagination(data: unknown, fallbackPage = 1): PageInfo {
  const f = flatten(data);
  const p = pick(f, ['pagination', 'paging', 'meta', 'page_info', 'pageInfo']);
  const src: AnyObj = isObj(p) ? { ...f, ...p } : f;
  const current = num(pick(src, ['current_page', 'currentPage', 'page', 'current'])) ?? fallbackPage;
  const total = num(pick(src, ['total_pages', 'totalPages', 'last_page', 'lastPage', 'total_page', 'max_page', 'pages']));
  const n = pick(src, ['has_next', 'hasNext', 'has_next_page', 'hasNextPage', 'next_page', 'next']);
  const hasNext = n === undefined ? undefined : n !== false && n !== 'false' && n !== 0 && n !== null;
  return { current, total, hasNext: hasNext ?? (total !== undefined ? current < total : undefined) };
}

const LIST_KEYS = ['donghua', 'donghua_list', 'anime_list', 'animeList', 'results', 'list', 'items', 'series'];

export function parseList(data: unknown, page = 1, keys: string[] = []): ListResult {
  return { items: normalizeItems(findArray(data, [...keys, ...LIST_KEYS])), page: parsePagination(data, page) };
}

// ───────────────────────── Home ─────────────────────────
export function parseHome(data: unknown): HomeData {
  const root = flatten(data);
  const sec = (keys: string[]) => normalizeItems(findArray(root, keys, false));
  const latest = sec(['latest_release', 'latest_releases', 'latest', 'latest_update', 'latest_donghua', 'terbaru', 'recent', 'new_release']);
  const ongoing = sec(['ongoing', 'ongoing_donghua', 'ongoing_series', 'on_going']);
  const completed = sec(['completed', 'completed_donghua', 'complete', 'finished']);
  const hero = sec(['hero', 'featured', 'slider', 'banner', 'spotlight', 'trending', 'popular'])[0] ?? latest[0] ?? ongoing[0] ?? null;
  return { hero, latest, ongoing, completed };
}

// ───────────────────────── Episodes / Detail ─────────────────────────
const EP_KEYS = ['episodes', 'episode_list', 'episodeList', 'episode_lists', 'episodes_list', 'list_episode', 'list_episodes', 'eps', 'chapters'];
const EP_HINT = /episode|[-/]eps?-?\d|-ep-?\d/i;

/** Cari array yang mayoritas isinya terlihat seperti episode (slug/url/judul memuat "episode"). */
function looseEpisodeArray(root: unknown): AnyObj[] {
  let best: AnyObj[] = [];
  let bestScore = 0;
  const walk = (n: unknown, depth: number) => {
    if (depth > 6) return;
    if (Array.isArray(n)) {
      const objs = n.filter(isObj);
      if (objs.length) {
        const score = objs.filter((o) => EP_HINT.test(str(pick(o, ['slug', 'episode_slug', 'url', 'href', 'link', 'endpoint'])) + ' ' + str(pick(o, ['title', 'name', 'episode'])))).length;
        if (score >= Math.max(1, objs.length / 2) && score > bestScore) { best = objs; bestScore = score; }
      }
      n.forEach((x) => walk(x, depth + 1));
    } else if (isObj(n)) Object.values(n).forEach((x) => walk(x, depth + 1));
  };
  walk(root, 0);
  return best;
}

export function parseEpisodes(r: AnyObj, loose = false): EpisodeRef[] {
  let arr = findArray(r, EP_KEYS, false);
  if (!arr.length && loose) arr = looseEpisodeArray(r);
  const out: EpisodeRef[] = [];
  for (const e of arr) {
    const slug = str(pick(e, ['slug', 'episode_slug', 'id'])) || slugFromUrl(pick(e, ['url', 'href', 'link', 'endpoint']));
    if (!slug) continue;
    let title = str(pick(e, ['title', 'name', 'episode_title', 'label', 'episode', 'number']));
    const numRaw = num(pick(e, ['episode_number', 'number', 'episode', 'ep']));
    const m = title.match(/episode\s*(\d+(?:\.\d+)?)/i) ?? title.match(/\b(\d+(?:\.\d+)?)\b/);
    const number = numRaw ?? (m ? Number(m[1]) : undefined);
    if (!title) title = number !== undefined ? `Episode ${number}` : slug;
    else if (/^\d+(\.\d+)?$/.test(title)) title = `Episode ${title}`;
    out.push({ slug, title, number, date: str(pick(e, ['date', 'released', 'release_date', 'published', 'uploaded', 'time'])) || undefined });
  }
  return out;
}

export function parseDetail(data: unknown): Detail {
  const r = flatten(data);
  return {
    title: str(pick(r, ['title', 'name', 'judul'])),
    altTitle: str(pick(r, ['alt_title', 'alternative_title', 'alternative', 'other_title', 'synonyms', 'japanese', 'native_title', 'title_alt'])),
    synopsis: str(pick(r, ['synopsis', 'sinopsis', 'description', 'desc', 'overview', 'plot'])),
    poster: str(pick(r, ['poster', 'image', 'thumbnail', 'cover', 'img', 'poster_url'])),
    genres: parseGenres(pick(r, ['genres', 'genre', 'tags', 'categories'])),
    status: str(pick(r, ['status', 'state'])),
    type: str(pick(r, ['type', 'format'])),
    year: str(pick(r, ['year', 'released', 'release_date', 'release_year', 'season'])),
    studio: str(pick(r, ['studio', 'studios', 'network', 'producer'])),
    rating: str(pick(r, ['rating', 'score'])),
    duration: str(pick(r, ['duration', 'durasi'])),
    episodes: parseEpisodes(r, true),
    recommendations: normalizeItems(
      findArray(r, ['recommendations', 'recommended', 'recommendation', 'rekomendasi', 'related', 'similar', 'related_donghua'], false),
    ),
  };
}

// ───────────────────────── Episode page ─────────────────────────
function extractSrc(v: any): string {
  if (typeof v !== 'string') return '';
  const m = v.match(/src=["']([^"']+)["']/i);
  let u = (m ? m[1] : v).trim();
  if (u.startsWith('//')) u = 'https:' + u;
  return /^https?:\/\//i.test(u) ? u : '';
}

function decodeMaybe(v: string): string {
  const t = v.replace(/\s/g, '');
  if (/^[A-Za-z0-9+/=]{40,}$/.test(t) && typeof atob === 'function') {
    try {
      const d = atob(t);
      if (/<iframe|https?:\/\//i.test(d)) return d;
    } catch {}
  }
  return v;
}

/** Pindai seluruh respons episode: ambil URL/iframe/base64 di mana pun, kecuali subtree download/poster/dll. */
function parseStreams(r: AnyObj): Stream[] {
  const out: Stream[] = [];
  const add = (name: string, raw: string) => {
    const u = extractSrc(decodeMaybe(raw));
    if (u && !out.some((s) => s.url === u)) out.push({ name: name || `Server ${out.length + 1}`, url: u });
  };
  const SKIP = /download|poster|image|thumb|cover|img|logo|banner|genre|recommend|related|episodes?_?list|subtitle|prev|next|canonical|permalink|^donghua$|^series$|^anime$/i;
  const walk = (node: any, key: string, depth: number, parent?: AnyObj) => {
    if (depth > 7 || node === null || node === undefined) return;
    if (typeof node === 'string') {
      if (depth <= 1 && /^(url|href|link|slug|id|endpoint)$/i.test(key)) return;
      const name = parent ? str(pick(parent, ['name', 'server', 'title', 'label', 'provider', 'quality'])) : '';
      add(name || key.replace(/_/g, ' '), node);
      return;
    }
    if (Array.isArray(node)) { node.forEach((n) => walk(n, key, depth + 1, parent)); return; }
    if (isObj(node)) {
      for (const [k, v] of Object.entries(node)) {
        if (SKIP.test(k)) continue;
        walk(v, k, depth + 1, node);
      }
    }
  };
  walk(r, '', 0);
  return out;
}

const toLinks = (arr: any[]): DownloadLink[] =>
  arr
    .map((l): DownloadLink | null => {
      if (typeof l === 'string') return /^https?:/i.test(l) ? { name: 'Download', url: l } : null;
      if (!isObj(l)) return null;
      const url = str(pick(l, ['url', 'link', 'href']));
      return url ? { name: str(pick(l, ['name', 'host', 'provider', 'server', 'title', 'label'])) || 'Download', url } : null;
    })
    .filter((x): x is DownloadLink => x !== null);

export function parseDownloads(raw: any): DownloadGroup[] {
  const groups: DownloadGroup[] = [];
  const push = (quality: string, links: DownloadLink[]) => {
    if (!links.length) return;
    const g = groups.find((x) => x.quality === quality);
    if (g) g.links.push(...links);
    else groups.push({ quality, links });
  };
  if (Array.isArray(raw)) {
    for (const it of raw) {
      if (!isObj(it)) continue;
      const q = str(pick(it, ['resolution', 'quality', 'res', 'format', 'title'])) || 'Download';
      const nested = pick(it, ['links', 'urls', 'servers', 'downloads', 'list']);
      if (Array.isArray(nested)) push(q, toLinks(nested));
      else if (isObj(nested)) push(q, toLinks(Object.entries(nested).map(([name, url]) => ({ name, url }))));
      else push(q, toLinks([it]));
    }
  } else if (isObj(raw)) {
    for (const [q, v] of Object.entries(raw)) {
      if (Array.isArray(v)) push(q, toLinks(v));
      else if (isObj(v)) push(q, toLinks(Object.entries(v).map(([name, url]) => ({ name, url }))));
      else if (typeof v === 'string') push('Download', toLinks([{ name: q, url: v }]));
    }
  }
  return groups;
}

function navSlug(v: any): string | undefined {
  if (!v || v === 'null') return undefined;
  if (typeof v === 'string') return slugFromUrl(v) || undefined;
  if (isObj(v)) return str(pick(v, ['slug', 'id'])) || slugFromUrl(pick(v, ['url', 'href', 'link', 'endpoint'])) || undefined;
  return undefined;
}

function findDetailSlug(n: unknown, depth = 0): string {
  if (depth > 6) return '';
  if (typeof n === 'string') return n.match(/\/detail\/([^/?#\s"']+)/)?.[1] ?? '';
  if (Array.isArray(n)) { for (const x of n) { const r = findDetailSlug(x, depth + 1); if (r) return r; } return ''; }
  if (isObj(n)) { for (const x of Object.values(n)) { const r = findDetailSlug(x, depth + 1); if (r) return r; } }
  return '';
}

export function parseEpisodePage(data: unknown): EpisodePage {
  const r = flatten(data);
  const s = pick(r, ['donghua', 'series', 'anime']);
  const info: Record<string, string> = {};
  for (const [k, v] of Object.entries(r)) {
    if (typeof v === 'string' || typeof v === 'number') {
      const val = String(v).trim();
      if (val && val.length < 200 && !/^https?:/i.test(val) && !/<\w+/.test(val)) info[k.replace(/_/g, ' ')] = val;
    }
  }
  return {
    title: str(pick(r, ['title', 'episode_title', 'name', 'episode'])),
    seriesTitle: str(pick(r, ['donghua_title', 'series_title', 'anime_title'])) || (isObj(s) ? str(pick(s, ['title', 'name'])) : ''),
    seriesSlug:
      str(pick(r, ['donghua_slug', 'series_slug', 'anime_slug', 'detail_slug'])) ||
      (isObj(s) ? str(pick(s, ['slug'])) || slugFromUrl(pick(s, ['url', 'href'])) : '') ||
      findDetailSlug(r),
    poster: str(pick(r, ['poster', 'image', 'thumbnail', 'cover', 'img'])),
    streams: parseStreams(r),
    downloads: parseDownloads(pick(r, ['downloads', 'download', 'download_links', 'download_list', 'downloadList', 'download_url'])),
    prev: navSlug(pick(r, ['prev_episode', 'previous_episode', 'prev', 'previous'])),
    next: navSlug(pick(r, ['next_episode', 'next'])),
    episodes: parseEpisodes(r),
    info,
  };
}

// ───────────────────────── Schedule ─────────────────────────
export const DAY_LABELS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const DAY_FULL: [string, number][] = [
  ['senin', 0], ['monday', 0], ['selasa', 1], ['tuesday', 1], ['rabu', 2], ['wednesday', 2], ['kamis', 3], ['thursday', 3],
  ['jumat', 4], ['jumaat', 4], ['friday', 4], ['sabtu', 5], ['saturday', 5], ['minggu', 6], ['ahad', 6], ['sunday', 6],
];
const DAY_ABBR: Record<string, number> = { sen: 0, mon: 0, sel: 1, tue: 1, rab: 2, wed: 2, kam: 3, thu: 3, jum: 4, fri: 4, sab: 5, sat: 5, min: 6, sun: 6 };
const dayIndex = (s: string): number => {
  const t = s.toLowerCase().replace(/[^a-z]/g, '');
  if (!t || t.length > 20) return -1;
  if (t in DAY_ABBR && t.length === 3) return DAY_ABBR[t];
  for (const [name, i] of DAY_FULL) if (t === name || t.startsWith(name)) return i;
  return -1;
};
export const todayIndex = () => (new Date().getDay() + 6) % 7;

const DAY_FIELDS = ['day', 'hari', 'day_name', 'dayName'];
const SCHED_LIST_KEYS = ['donghua', 'anime', 'items', 'list', 'schedule', 'data', 'shows', 'series', 'result', 'results'];

/** Pindai seluruh respons: objek berkunci nama hari ATAU objek dengan field day/hari. */
export function parseSchedule(data: unknown): ScheduleDay[] {
  const days = new Map<number, Item[]>();
  const put = (label: string, list: AnyObj[]) => {
    const i = dayIndex(label);
    if (i < 0) return;
    days.set(i, [...(days.get(i) ?? []), ...normalizeItems(list)]);
  };
  const walk = (node: unknown, depth: number) => {
    if (depth > 7) return;
    if (Array.isArray(node)) { node.forEach((n) => walk(n, depth + 1)); return; }
    if (!isObj(node)) return;
    const lab = str(pick(node, DAY_FIELDS));
    if (lab && dayIndex(lab) >= 0) {
      const rest: AnyObj = {};
      for (const [k, v] of Object.entries(node)) if (!DAY_FIELDS.includes(k)) rest[k] = v;
      put(lab, findArray(rest, SCHED_LIST_KEYS));
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (dayIndex(k) >= 0 && (Array.isArray(v) || isObj(v))) put(k, Array.isArray(v) ? v.filter(isObj) : findArray(v, SCHED_LIST_KEYS));
      else walk(v, depth + 1);
    }
  };
  walk(data, 0);
  return DAY_LABELS.map((label, index) => ({ index, label, items: days.get(index) ?? [] })).filter((d) => d.items.length);
}
