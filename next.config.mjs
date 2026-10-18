/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Memastikan aset lokal di public/assets bekerja tanpa kendala
  },
};

export default nextConfig;
