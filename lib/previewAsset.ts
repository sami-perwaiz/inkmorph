/**
 * Two-tier asset delivery:
 *
 * PREVIEW (display only)
 * - Gallery grids, pack icons, modals, wallpaper previews
 * - Build-time WebP files under `/previews/` (+ wallpaper `/wallpapers/previews/`)
 * - Optional Next.js Image optimization for responsive srcset
 *
 * ORIGINAL (download / copy only)
 * - Full-resolution PNG via canonical `/assets/` URLs
 * - Used exclusively by download/copy pipelines
 */

import { getCanonicalFilename } from "@/lib/canonicalAsset";
import type { Illustration } from "@/types/illustration";

export type PreviewContext = "grid" | "tile" | "detail" | "modal" | "thumb";

/** Max display widths — previews are generated at 2× for retina. */
export const PREVIEW_VARIANT = {
  sm: "sm",
  lg: "lg",
} as const;

export type PreviewVariant = (typeof PREVIEW_VARIANT)[keyof typeof PREVIEW_VARIANT];

const PREVIEW_CONTEXT_VARIANT: Record<PreviewContext, PreviewVariant> = {
  grid: "sm",
  tile: "sm",
  thumb: "sm",
  detail: "sm",
  modal: "lg",
};

/** Public preview URL — use for `<Image src>` only, never for download/copy. */
export function getPreviewAssetUrl(
  illustration: Pick<Illustration, "id" | "filename">,
  context: PreviewContext = "grid"
): string {
  const variant = PREVIEW_CONTEXT_VARIANT[context];
  const basename = getCanonicalFilename(illustration).replace(/\.[^.]+$/i, "");
  return `/previews/${basename}-${variant}.webp`;
}

/** Wallpaper detail/listing preview — separate from full download file. */
export function getWallpaperPreviewUrl(
  wallpaperId: string,
  context: "thumb" | "detail" = "detail"
): string {
  const variant = context === "thumb" ? "sm" : "sm";
  return `/wallpapers/previews/${wallpaperId}-${variant}.webp`;
}

/**
 * Pack / wallpaper listing card thumbnail — build-time WebP only.
 * Detail pages keep `previewSrc` and download originals unchanged.
 */
export function getListingCardThumbnailUrl(publicPngPath: string): string {
  const match = publicPngPath.match(/^(\/(?:packs|wallpapers))\/(.+)\.png$/i);

  if (!match) {
    return publicPngPath;
  }

  return `${match[1]}/thumbs/${match[2]}.webp`;
}

/** Canonical original URL — download/copy pipelines only. */
export function getOriginalAssetUrl(canonicalSrc: string): string {
  return canonicalSrc;
}
