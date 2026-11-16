import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function YearPills({ current }: { current: string }) {
  const y = new Date().getFullYear();
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 8 }).map((_, i) => {
        const v = String(y - i);
        return (
          <Link key={v} href={`/season/${v}`}
            className={cn('rounded-full border px-3.5 py-1.5 text-sm transition duration-200',
              v === current ? 'border-black bg-gold text-black shadow-brutal-sm' : 'border-line bg-surface-2 hover:border-gold hover:text-gold')}>
            {v}
          </Link>
        );
      })}
    </div>
  );
}
