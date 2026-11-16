import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';

export const metadata: Metadata = { title: 'Donghua Ongoing', description: 'Donghua yang sedang tayang, update tiap episode baru.' };

export default function Page() {
  return <PagedGrid kind="ongoing" title="Donghua Ongoing" description="Donghua yang sedang tayang, update tiap episode baru." />;
}
