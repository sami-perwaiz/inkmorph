import type { MetadataRoute } from "next";

import { getVisibleIconPacks } from "@/lib/iconPacks";
import { resolveSiteUrl } from "@/lib/siteUrl";
import { CATEGORY_SEO } from "@/lib/seo/categories";
import { WALLPAPER_PACKS } from "@/lib/wallpaperPacks";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = resolveSiteUrl();
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/packs`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/wallpapers`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/pricing`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/license`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap = Object.values(CATEGORY_SEO).map(
    (category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })
  );

  const packPages: MetadataRoute.Sitemap = getVisibleIconPacks().map(
    (pack) => ({
      url: `${siteUrl}/packs/${pack.id}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })
  );

  const wallpaperPages: MetadataRoute.Sitemap = WALLPAPER_PACKS.map((pack) => ({
    url: `${siteUrl}/wallpapers/${pack.id}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...packPages, ...wallpaperPages];
}
