import type { Metadata } from 'next';
import AdminPremium from '@/components/AdminPremium';

export const metadata: Metadata = { title: 'Admin Premium', robots: { index: false, follow: false } };
export default function Page() { return <AdminPremium />; }
