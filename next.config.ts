import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vercel.com",
      },
    ],
  },
  // Allow server.ts to use the built Next.js app
  serverExternalPackages: ['ws', 'ioredis', 'pg', 'technicalindicators'],
};

export default nextConfig;
