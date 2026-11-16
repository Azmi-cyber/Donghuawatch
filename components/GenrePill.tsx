import Link from 'next/link';
import type { Genre } from '@/lib/types';

export default function GenrePill({ genre }: { genre: Genre }) {
  return (
    <Link
      href={`/genre/${genre.slug}`}
      className="inline-flex items-center rounded-full border border-line bg-surface-2 px-3.5 py-1.5 text-sm text-ink transition duration-200 hover:border-gold hover:bg-gold/10 hover:text-gold"
    >
      {genre.name}
    </Link>
  );
}
