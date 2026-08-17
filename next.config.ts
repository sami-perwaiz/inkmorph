import type { NextConfig } from "next";

import assetUrlMap from "./lib/asset-url-map.json";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const canonicalAssetRewrites = Object.entries(assetUrlMap.routes).map(
  ([filename, destination]) => ({
    source: `/assets/${filename}`,
    destination,
  })
);

const PRODUCTION_SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: "upgrade-insecure-requests",
  },
] as const;

const nextConfig: NextConfig = {
  images: {
    /**
     * Vercel Image Optimization returns 402 once the plan quota is exceeded.
     * Serve canonical /assets previews directly (still lazy + viewport-gated).
     * Re-enable optimization after upgrading Vercel image quota/billing.
     */
    unoptimized: process.env.VERCEL === "1",
    formats: ["image/avif", "image/webp"],
    /** Viewport-relative previews — trimmed for faster mobile delivery. */
    deviceSizes: [360, 414, 640, 750, 828, 1080, 1200],
    /** Fixed-width previews — includes 2×/3× retina for 150–654px display sizes. */
    imageSizes: [96, 128, 168, 256, 300, 384, 512, 640],
    minimumCacheTTL: ONE_YEAR_SECONDS,
    qualities: [75, 80, 85, 90, 92],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async rewrites() {
    return canonicalAssetRewrites;
  },
  async headers() {
    const securityHeaders =
      process.env.NODE_ENV === "production" ? PRODUCTION_SECURITY_HEADERS : [];

    const cacheHeaders = [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/packs/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/wallpapers/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/illustrations/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR_SECONDS}, immutable`,
          },
        ],
      },
    ];

    if (securityHeaders.length === 0) {
      return cacheHeaders;
    }

    return [
      {
        source: "/:path*",
        headers: [...securityHeaders],
      },
      ...cacheHeaders,
    ];
  },
  poweredByHeader: false,
  /** Hide the floating Next.js "N" badge that overlaps the gallery. */
  devIndicators: false,
};

export default nextConfig;
