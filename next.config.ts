import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/store',
        permanent: true,
      },
      {
        source: '/products/:path*',
        destination: '/store/:path*',
        permanent: true,
      },
      {
        source: '/buyers',
        destination: '/store',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
