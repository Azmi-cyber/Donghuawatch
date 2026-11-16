/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Poster selalu lewat /api/image (proxy) memakai <img>, jadi optimasi next/image tidak dipakai.
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
};
module.exports = nextConfig;
