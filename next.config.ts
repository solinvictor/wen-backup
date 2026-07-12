import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
