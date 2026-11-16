import type { Metadata } from 'next';
import WatchView from '@/components/WatchView';
import { humanize } from '@/lib/utils';

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const t = humanize(params.slug);
  return { title: `Nonton ${t}`, description: `Streaming dan download ${t} subtitle Indonesia.` };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <WatchView slug={params.slug} />;
}
