import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';

export const metadata: Metadata = { title: 'Donghua Completed', description: 'Donghua yang sudah tamat dan bisa ditonton maraton.' };

export default function Page() {
  return <PagedGrid kind="completed" title="Donghua Completed" description="Donghua yang sudah tamat dan bisa ditonton maraton." />;
}
