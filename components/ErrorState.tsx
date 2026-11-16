import { RotateCw, TriangleAlert } from 'lucide-react';
import EmptyState from './EmptyState';

export default function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={<TriangleAlert size={34} />}
      title="Gagal memuat data"
      message={message ?? 'Terjadi kesalahan saat mengambil data. Coba lagi sebentar lagi.'}
      action={onRetry && (
        <button onClick={onRetry} className="btn-primary"><RotateCw size={16} /> Coba Lagi</button>
      )}
    />
  );
}
