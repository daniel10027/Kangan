/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@kangan/shared", "@kangan/ui", "@kangan/payments"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
