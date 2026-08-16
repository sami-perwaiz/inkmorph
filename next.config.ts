import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1200, 1440, 1920],
    imageSizes: [96, 128, 168, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  poweredByHeader: false,
  /** Hide the floating Next.js "N" badge that overlaps the gallery. */
  devIndicators: false,
};

export default nextConfig;
