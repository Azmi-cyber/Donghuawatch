import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';
import YearPills from '@/components/YearPills';

export function generateMetadata({ params }: { params: { year: string } }): Metadata {
  return { title: `Donghua ${params.year}`, description: `Donghua rilisan tahun ${params.year}.` };
}

export default function Page({ params }: { params: { year: string } }) {
  return <PagedGrid kind="season" arg={params.year} header={<YearPills current={params.year} />} />;
}
