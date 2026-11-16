import type { Metadata } from 'next';
import PagedGrid from '@/components/PagedGrid';
import { humanize } from '@/lib/utils';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const name = humanize(params.slug);
  return { title: `Donghua ${name}`, description: `Daftar donghua genre ${name}.` };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <PagedGrid kind="genre" arg={params.slug} />;
}
