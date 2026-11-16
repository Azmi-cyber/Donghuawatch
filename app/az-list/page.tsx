import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';
import AzLetters from '@/components/AzLetters';

export const metadata: Metadata = { title: 'A-Z List', description: 'Daftar donghua berdasarkan huruf awal judul.' };

export default function Page() {
  return <PagedGrid kind="az" title="A-Z List" header={<AzLetters />} />;
}
