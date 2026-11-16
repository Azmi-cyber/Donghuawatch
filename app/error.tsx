'use client';
import ErrorState from '@/components/ErrorState';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="container-x py-16"><ErrorState message={error.message || undefined} onRetry={reset} /></div>;
}
