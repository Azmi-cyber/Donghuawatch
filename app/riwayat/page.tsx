import type { Metadata } from 'next';
import RiwayatView from '@/components/RiwayatView';

export const metadata: Metadata = { title: 'Riwayat Tontonan', description: 'Episode donghua yang terakhir kamu tonton.' };

export default function Page() {
  return <RiwayatView />;
}
