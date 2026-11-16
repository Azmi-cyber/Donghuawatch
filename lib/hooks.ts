'use client';
import { useEffect, useState } from 'react';
import { ApiError, toApiError } from './api';
import { useApp } from './context';

export function useApi<T>(fn: () => Promise<T>, deps: unknown[], enabled = true) {
  const [state, setState] = useState<{ data: T | null; error: ApiError | null; loading: boolean }>({
    data: null, error: null, loading: enabled,
  });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) { setState((s) => ({ ...s, loading: false })); return; }
    let off = false;
    setState({ data: null, error: null, loading: true });
    fn()
      .then((d) => { if (!off) setState({ data: d, error: null, loading: false }); })
      .catch((e) => { if (!off) setState({ data: null, error: toApiError(e), loading: false }); });
    return () => { off = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick, enabled]);

  return { ...state, retry: () => setTick((t) => t + 1) };
}

/** Riwayat tontonan (localStorage, maks 50, dedupe by slug). */
export function useRiwayat() {
  const { history, historyReady, addHistory, removeHistory, clearHistory } = useApp();
  return { history, ready: historyReady, add: addHistory, remove: removeHistory, clear: clearHistory };
}

export function useSearchState() {
  const { searchOpen, setSearchOpen, recent, addRecent, removeRecent, clearRecent } = useApp();
  return { open: searchOpen, setOpen: setSearchOpen, recent, addRecent, removeRecent, clearRecent };
}
