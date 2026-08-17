import type { MetadataRoute } from "next";

import { resolveSiteUrl } from "@/lib/siteUrl";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/signin", "/signup", "/complete-profile"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
