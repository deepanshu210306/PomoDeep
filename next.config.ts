import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['mongoose'],
  experimental: {
    serverActions: {
      bodySizeLimit: '8mb',
    },
    middlewareClientMaxBodySize: '8mb',
  },
};

export default nextConfig;
