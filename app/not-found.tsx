import Link from 'next/link';
import EmptyState from '@/components/EmptyState';

export default function NotFound() {
  return (
    <div className="container-x py-16">
      <p className="mb-2 text-center font-heading text-6xl font-extrabold text-gold">404</p>
      <EmptyState title="Halaman tidak ditemukan" message="Alamat yang kamu buka tidak ada atau sudah dipindahkan." action={<Link href="/" className="btn-primary">Kembali ke Home</Link>} />
    </div>
  );
}
