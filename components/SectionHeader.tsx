import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="border-l-4 border-gold pl-3 font-heading text-lg font-bold sm:text-xl">{title}</h2>
      {href && (
        <Link href={href} className="inline-flex items-center gap-0.5 text-sm font-medium text-gold transition hover:text-gold-light">
          Lihat Semua <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}
