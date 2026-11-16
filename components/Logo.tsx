import Link from 'next/link';

export default function Logo({ size = 34 }: { size?: number }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="DonghuaWatch - beranda">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={size} height={size} className="rounded-md" />
      <span className="font-heading text-lg font-bold tracking-tight">
        <span className="text-gold">Donghua</span>
        <span className="text-ink">Watch</span>
      </span>
    </Link>
  );
}
