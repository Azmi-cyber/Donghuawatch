import type { Metadata } from 'next';
import ScheduleView from '@/components/ScheduleView';

export const metadata: Metadata = { title: 'Jadwal Rilis', description: 'Jadwal tayang donghua per hari.' };

export default function Page() {
  return <ScheduleView />;
}
