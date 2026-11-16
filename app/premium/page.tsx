import type { Metadata } from 'next';
import PremiumView from '@/components/PremiumView';

export const metadata: Metadata = { title: 'Premium', description: 'Nonton donghua tanpa iklan dengan akun Premium DonghuaWatch.' };
export default function Page() { return <PremiumView />; }
