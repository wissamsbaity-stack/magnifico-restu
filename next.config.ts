import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/locations", destination: "/", permanent: true }];
  },
  // Soft-nav between admin sections can reuse recent RSC payloads.
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  // Allow ngrok (and similar) origins to load Next.js dev assets on mobile
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok.io",
    "*.ngrok.dev",
  ],
  images: {
    // The default logo/menu placeholder is an SVG in /public.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [96, 128, 180, 256, 280, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.eu-central-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
