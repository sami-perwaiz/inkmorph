import type { Metadata } from "next";

import { resolveSiteUrl } from "@/lib/siteUrl";

export const SITE_NAME = "InkMorph";
export const DEFAULT_OG_IMAGE = "/logo.png";

export function absoluteUrl(path: string): string {
  const base = resolveSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

interface PageMetadataOptions {
  /** Page title without site suffix — template adds " · InkMorph" when using layout template. */
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  noIndex?: boolean;
  keywords?: string[];
  /** When true, title is used verbatim (for homepage-style full titles). */
  absoluteTitle?: boolean;
}

export function buildPageMetadata(options: PageMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    ogImage = DEFAULT_OG_IMAGE,
    ogImageAlt,
    ogType = "website",
    noIndex = false,
    keywords,
    absoluteTitle = false,
  } = options;

  const canonical = absoluteUrl(path);
  const socialTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      type: ogType,
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: ogImage,
          alt: ogImageAlt ?? socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [ogImage],
    },
  };
}

export function buildHomeMetadata(): Metadata {
  return buildPageMetadata({
    title: "InkMorph — Premium 3D Icons, Illustrations & Wallpapers",
    description:
      "Discover premium 3D icons, illustrations, wallpapers and creative assets for modern digital products, websites and designs.",
    path: "/",
    absoluteTitle: true,
    keywords: [
      "3D icons",
      "3D icon packs",
      "premium 3D icons",
      "3D illustrations",
      "3D assets",
      "3D wallpapers",
      "creative assets",
      "design assets",
      "UI design resources",
      "InkMorph",
    ],
  });
}

export function buildPrivatePageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  return buildPageMetadata({
    title,
    description,
    path,
    noIndex: true,
  });
}
