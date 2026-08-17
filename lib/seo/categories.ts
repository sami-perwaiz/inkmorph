import type { FilterValue } from "@/types/illustration";

import { CATEGORY_SLUG_BY_FILTER } from "@/lib/seo/routes";

export interface CategorySeoConfig {
  filter: Exclude<FilterValue, "all">;
  slug: string;
  title: string;
  description: string;
  heading: string;
  intro: string;
  keywords: string[];
}

export const CATEGORY_SEO: Record<
  Exclude<FilterValue, "all">,
  CategorySeoConfig
> = {
  avatar: {
    filter: "avatar",
    slug: CATEGORY_SLUG_BY_FILTER.avatar,
    title: "Premium 3D Avatars",
    heading: "3D Avatars",
    description:
      "Explore premium 3D avatars designed for modern interfaces, websites, apps and digital products. Download high-quality PNG icons from InkMorph.",
    intro:
      "Explore premium 3D avatars designed for modern interfaces, websites and digital products.",
    keywords: [
      "3D avatars",
      "premium 3D avatars",
      "avatar icons",
      "profile icons",
      "3D icon pack",
      "UI design resources",
    ],
  },
  character: {
    filter: "character",
    slug: CATEGORY_SLUG_BY_FILTER.character,
    title: "Premium 3D Characters",
    heading: "3D Characters",
    description:
      "Browse premium 3D character illustrations and mascots for apps, websites, presentations and creative projects. High-quality assets from InkMorph.",
    intro:
      "Browse premium 3D character illustrations and mascots for apps, websites and creative projects.",
    keywords: [
      "3D characters",
      "3D character icons",
      "mascot icons",
      "3D illustrations",
      "premium design assets",
    ],
  },
  object: {
    filter: "object",
    slug: CATEGORY_SLUG_BY_FILTER.object,
    title: "Premium 3D Objects & Icons",
    heading: "3D Objects",
    description:
      "Discover premium 3D object icons and props for product design, UI kits, websites and marketing visuals. Download creative assets from InkMorph.",
    intro:
      "Discover premium 3D object icons and props for product design, UI kits and marketing visuals.",
    keywords: [
      "3D objects",
      "3D icons",
      "UI icons",
      "object icons",
      "3D icon packs",
      "design assets",
    ],
  },
  abstract: {
    filter: "abstract",
    slug: CATEGORY_SLUG_BY_FILTER.abstract,
    title: "Premium 3D Abstract Illustrations",
    heading: "3D Abstract",
    description:
      "Explore premium 3D abstract illustrations, decorative shapes and modern design elements for digital products and creative projects on InkMorph.",
    intro:
      "Explore premium 3D abstract illustrations and decorative design elements for modern digital products.",
    keywords: [
      "3D abstract",
      "abstract 3D icons",
      "decorative 3D assets",
      "3D illustrations",
      "creative assets",
    ],
  },
};

export function getCategorySeoConfig(
  filter: Exclude<FilterValue, "all">
): CategorySeoConfig {
  return CATEGORY_SEO[filter];
}

export function getCategorySeoBySlug(slug: string): CategorySeoConfig | null {
  const entry = Object.values(CATEGORY_SEO).find((config) => config.slug === slug);
  return entry ?? null;
}
