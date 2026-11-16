import type { Metadata } from 'next';
import GenreView from '@/components/GenreView';

export const metadata: Metadata = { title: 'Genre', description: 'Jelajahi donghua berdasarkan genre dan tahun.' };

export default function Page() {
  return <GenreView />;
}
