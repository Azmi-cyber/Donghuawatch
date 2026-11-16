import type { Metadata } from 'next';
import DetailView from '@/components/DetailView';
import { humanize } from '@/lib/utils';

// Tidak fetch di server supaya navigasi tidak menunggu API sumber.
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = humanize(params.slug);
  return { title: t, description: `Nonton ${t} subtitle Indonesia.` };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <DetailView slug={params.slug} />;
}
