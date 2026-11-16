'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { HistoryEntry } from './types';

const LS_HISTORY = 'dw:history'; // + ":" + email | guest
const LS_OLD = 'dw:history';
const LS_RECENT = 'dw:recent';
const LS_META = 'dw:meta';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, val: unknown) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const merge = (a: HistoryEntry[], b: HistoryEntry[]) => {
  const map = new Map<string, HistoryEntry>();
  [...a, ...b].forEach((h) => { const o = map.get(h.slug); if (!o || h.timestamp > o.timestamp) map.set(h.slug, h); });
  return [...map.values()].sort((x, y) => y.timestamp - x.timestamp).slice(0, 50);
};

/** Simpan poster/judul donghua dari halaman detail supaya riwayat punya poster. */
export function rememberMeta(slug: string, meta: { title: string; poster: string }) {
  const all = read<Record<string, { title: string; poster: string }>>(LS_META, {});
  all[slug] = meta;
  const keys = Object.keys(all);
  if (keys.length > 200) delete all[keys[0]];
  write(LS_META, all);
}
export const getMeta = (slug: string) => read<Record<string, { title: string; poster: string }>>(LS_META, {})[slug];

interface Ctx {
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  recent: string[];
  addRecent: (k: string) => void;
  removeRecent: (k: string) => void;
  clearRecent: () => void;
  history: HistoryEntry[];
  historyReady: boolean;
  addHistory: (e: HistoryEntry) => void;
  removeHistory: (slug: string) => void;
  clearHistory: () => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const email = session?.user?.email?.toLowerCase() ?? '';
  const keyRef = useRef(`${LS_HISTORY}:guest`);

  const [searchOpen, setSearchOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyReady, setReady] = useState(false);

  // Riwayat dipisah per akun Google. Saat login, riwayat tamu digabung ke akun.
  useEffect(() => {
    if (status === 'loading') return;
    const guestKey = `${LS_HISTORY}:guest`;
    const key = email ? `${LS_HISTORY}:${email}` : guestKey;
    keyRef.current = key;

    let guest = read<HistoryEntry[]>(guestKey, []);
    const old = read<HistoryEntry[]>(LS_OLD, []);
    if (Array.isArray(old) && old.length) { guest = merge(guest, old); try { localStorage.removeItem(LS_OLD); } catch {} write(guestKey, guest); }

    let h = key === guestKey ? guest : read<HistoryEntry[]>(key, []);
    if (key !== guestKey && guest.length) { h = merge(h, guest); write(key, h); write(guestKey, []); }
    setHistory(h);
    setRecent(read<string[]>(LS_RECENT, []));
    setReady(true);
  }, [status, email]);

  const addRecent = useCallback((k: string) => {
    const kw = k.trim();
    if (!kw) return;
    setRecent((prev) => {
      const next = [kw, ...prev.filter((x) => x.toLowerCase() !== kw.toLowerCase())].slice(0, 5);
      write(LS_RECENT, next);
      return next;
    });
  }, []);
  const removeRecent = useCallback((k: string) => {
    setRecent((prev) => { const next = prev.filter((x) => x !== k); write(LS_RECENT, next); return next; });
  }, []);
  const clearRecent = useCallback(() => { setRecent([]); write(LS_RECENT, []); }, []);

  const addHistory = useCallback((e: HistoryEntry) => {
    setHistory((prev) => {
      const next = [e, ...prev.filter((h) => h.slug !== e.slug)].slice(0, 50);
      write(keyRef.current, next);
      return next;
    });
  }, []);
  const removeHistory = useCallback((slug: string) => {
    setHistory((prev) => { const next = prev.filter((h) => h.slug !== slug); write(keyRef.current, next); return next; });
  }, []);
  const clearHistory = useCallback(() => { setHistory([]); write(keyRef.current, []); }, []);

  const value = useMemo<Ctx>(
    () => ({ searchOpen, setSearchOpen, recent, addRecent, removeRecent, clearRecent, history, historyReady, addHistory, removeHistory, clearHistory }),
    [searchOpen, recent, addRecent, removeRecent, clearRecent, history, historyReady, addHistory, removeHistory, clearHistory],
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const c = useContext(AppContext);
  if (!c) throw new Error('useApp harus dipakai di dalam <AppProvider>');
  return c;
}
