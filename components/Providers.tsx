'use client';
import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'sonner';
import { AppProvider } from '@/lib/context';
import SearchModal from './SearchModal';
import AdScripts from './AdScripts';
import AdblockWall from './AdblockWall';
import PwaRegister from './PwaRegister';
import VisitorTracker from './VisitorTracker';

function ScrollTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppProvider>
        {children}
        <SearchModal />
        <ScrollTop />
        <AdScripts />
        <AdblockWall />
        <PwaRegister />
        <VisitorTracker />
        <Toaster
          theme="dark"
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#4b4b52',
              border: '2px solid #0a0a0a',
              boxShadow: '4px 4px 0 0 #f2c230',
              color: '#f5f5f4',
              fontWeight: 700,
              borderRadius: 4,
            },
          }}
        />
      </AppProvider>
    </SessionProvider>
  );
}
