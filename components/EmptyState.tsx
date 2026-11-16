import { ReactNode } from 'react';
import { Clapperboard } from 'lucide-react';

export default function EmptyState({ title, message, action, icon }: { title: string; message?: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
      <div className="mb-4 grid h-20 w-20 place-items-center rounded-full border border-gold/30 bg-surface-2 text-gold">
        {icon ?? <Clapperboard size={34} />}
      </div>
      <h3 className="font-heading text-lg font-bold">{title}</h3>
      {message && <p className="mt-1 max-w-md text-sm text-muted">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
