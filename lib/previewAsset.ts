/**
 * Two-tier asset delivery:
 *
 * PREVIEW (display only)
 * - Gallery grids, pack icons, modals, wallpaper previews
 * - Served through Next.js Image → WebP/AVIF at viewport-appropriate sizes
 * - Configured in `lib/imageDelivery.ts`
 *
 * ORIGINAL (download / copy only)
 * - Full-resolution PNG fetched on demand via `lib/originalAssetCache.ts`
 * - Used exclusively by `lib/illustrationActions.ts` and `lib/packIconDownloads.ts`
 *
 * Preview optimization never affects downloaded file quality.
 */

export type PreviewContext = "grid" | "tile" | "detail" | "modal" | "thumb";

/** Canonical original URL — use only for download/copy pipelines, never for `<Image src>`. */
export function getOriginalAssetUrl(canonicalSrc: string): string {
  return canonicalSrc;
}
