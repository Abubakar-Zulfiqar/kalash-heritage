import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server build (.next/standalone) for the VPS
  output: "standalone",
  // Nginx handles compression and the X-Powered-By header is noise
  compress: false,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Default list goes up to 3840px; nothing on this site needs more than 1920
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Optimized images are cached on disk for 30 days
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
