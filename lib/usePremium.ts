'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export interface PremiumState { ready: boolean; premium: boolean; until: number; admin: boolean }

export function usePremium(): PremiumState {
  const { data: session, status } = useSession();
  const email = session?.user?.email ?? '';
  const [st, setSt] = useState<PremiumState>({ ready: false, premium: false, until: 0, admin: false });

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { setSt({ ready: true, premium: false, until: 0, admin: false }); return; }
    let off = false;
    fetch('/api/premium/me', { cache: 'no-store' })
      .then((r) => r.json())
      .then((j) => { if (!off) setSt({ ready: true, premium: !!j.premium, until: Number(j.until) || 0, admin: !!j.admin }); })
      .catch(() => { if (!off) setSt({ ready: true, premium: false, until: 0, admin: false }); });
    return () => { off = true; };
  }, [status, email]);

  return st;
}
