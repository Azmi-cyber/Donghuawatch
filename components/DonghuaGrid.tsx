import type { Item } from '@/lib/types';
import { cn } from '@/lib/utils';
import DonghuaCard from './DonghuaCard';

/** scroll=true → horizontal scroll di mobile, grid mulai sm. */
export default function DonghuaGrid({ items, scroll = false, limit }: { items: Item[]; scroll?: boolean; limit?: number }) {
  const list = limit ? items.slice(0, limit) : items;
  return (
    <div
      className={cn(
        scroll
          ? '-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
          : 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
      )}
    >
      {list.map((it, i) => (
        <DonghuaCard key={`${it.href}-${i}`} item={it} className={scroll ? 'w-36 shrink-0 sm:w-auto' : undefined} />
      ))}
    </div>
  );
}
