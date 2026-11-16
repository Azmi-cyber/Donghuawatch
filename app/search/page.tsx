import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';

export const metadata: Metadata = { title: 'Pencarian', description: 'Cari donghua favoritmu.' };

export default function Page() {
  return <PagedGrid kind="search" />;
}
