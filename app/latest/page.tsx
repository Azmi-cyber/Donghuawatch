import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';

export const metadata: Metadata = { title: 'Update Terbaru', description: 'Episode donghua yang baru dirilis.' };

export default function Page() {
  return <PagedGrid kind="latest" title="Update Terbaru" description="Episode donghua yang baru dirilis." />;
}
