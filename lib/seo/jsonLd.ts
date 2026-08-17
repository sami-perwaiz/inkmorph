import type { IconPack } from "@/lib/iconPacks";
import type { WallpaperPack } from "@/lib/wallpaperPacks";
import { PRICING_PLANS } from "@/lib/pricingPlans";

import { absoluteUrl } from "@/lib/seo/metadata";

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "InkMorph",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/logo.png"),
  };
}

export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "InkMorph",
    url: absoluteUrl("/"),
    description:
      "Premium 3D icons, illustrations, wallpapers and creative assets for modern digital products.",
  };
}

export function buildBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildPackCollectionJsonLd(pack: IconPack) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pack.title,
    description: pack.description,
    url: absoluteUrl(`/packs/${pack.id}`),
    isPartOf: {
      "@type": "WebSite",
      name: "InkMorph",
      url: absoluteUrl("/"),
    },
    image: absoluteUrl(pack.thumbnailSrc),
  };
}

export function buildWallpaperImageJsonLd(pack: WallpaperPack) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: `${pack.title} iPhone wallpaper`,
    description: `${pack.title} premium iPhone wallpaper by ${pack.author} on InkMorph.`,
    contentUrl: absoluteUrl(pack.previewSrc),
    thumbnailUrl: absoluteUrl(pack.thumbnailSrc),
    url: absoluteUrl(`/wallpapers/${pack.id}`),
    author: {
      "@type": "Person",
      name: pack.author,
    },
  };
}

export function buildPricingJsonLd() {
  const offers = PRICING_PLANS.map((plan) => {
    const isFree = plan.price.toLowerCase() === "free";
    const priceMatch = plan.price.match(/\$(\d+(?:\.\d+)?)/);
    const price = priceMatch ? priceMatch[1] : undefined;

    return {
      "@type": "Offer",
      name: plan.name,
      description: plan.description,
      price: isFree ? "0" : price,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: absoluteUrl("/pricing"),
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "InkMorph Premium 3D Assets",
    description:
      "Premium 3D icons, illustrations and wallpapers for modern digital products.",
    brand: {
      "@type": "Brand",
      name: "InkMorph",
    },
    offers,
  };
}
