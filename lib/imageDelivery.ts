/**
 * Preview-only image delivery settings.
 * Downloads always use original source paths via `lib/illustrationActions.ts`
 * and `lib/packIconDownloads.ts` — never these optimized URLs.
 */

/** High-quality preview compression — sharp without visible artifacts. */
export const IMAGE_PREVIEW_QUALITY = {
  /** Main gallery grid and pack/wallpaper listing cards. */
  grid: 75,
  /** Fixed-size tiles (pack icon grid). */
  tile: 80,
  /** Detail-page previews (wallpaper portrait, etc.). */
  detail: 85,
  /** Full-screen preview modal. */
  modal: 90,
} as const;

/** Fixed pixel widths — avoids over-fetching on mobile vs desktop viewports. */
export const GALLERY_CARD_IMAGE_SIZES =
  "(max-width: 767px) 104px, (max-width: 1199px) 140px, 384px";

/** Gallery grid layout — mobile/tablet compact; desktop unchanged at `desktop:`. */
export const GALLERY_GRID_CLASS =
  "gallery-grid grid w-full grid-cols-3 gap-3 px-5 justify-items-center tablet:grid-cols-4 tablet:gap-4 tablet:px-[50px] desktop:grid-cols-4 desktop:gap-5 desktop:justify-items-stretch wide:grid-cols-5";

/** Max tile width per breakpoint — keeps mobile/tablet icons compact in their grid cells. */
export const GALLERY_CARD_CLASS =
  "gallery-grid-card relative aspect-square w-full max-w-[104px] tablet:max-w-[140px] desktop:max-w-none";

/** Pack detail icons — display capped at 150px across breakpoints. */
export const PACK_ICON_IMAGE_SIZES =
  "(max-width: 767px) 150px, (max-width: 1199px) 150px, 150px";

/** Pack + wallpaper listing thumbnails (654×400 Figma tile). */
export const PACK_WALLPAPER_THUMB_IMAGE_SIZES =
  "(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 654px";

/** Wallpaper detail portrait preview (277×600). */
export const WALLPAPER_DETAIL_IMAGE_SIZES =
  "(max-width: 767px) min(277px, 100vw), 277px";

/** Gallery preview modal — larger on tablet/desktop. */
export const IMAGE_PREVIEW_MODAL_SIZES =
  "(max-width: 767px) min(92vw, 400px), (max-width: 1199px) 440px, 480px";

/**
 * Optimized Next/Image previews — resized WebP/AVIF for fast grid and modal display.
 * Download/copy actions use canonical originals via `lib/illustrationActions.ts`.
 */
export const PREVIEW_IMAGE_PROPS = {
  loading: "lazy" as const,
} as const;

/** Priority LCP tiles must not combine with native lazy loading. */
export function getPreviewImageProps(priority: boolean) {
  return priority
    ? { priority: true as const, fetchPriority: "high" as const }
    : PREVIEW_IMAGE_PROPS;
}

/**
 * @deprecated Prefer {@link PREVIEW_IMAGE_PROPS} for on-screen previews.
 * Unoptimized canonical URLs force full-size PNG loads and break preview performance.
 */
export const CANONICAL_ASSET_IMAGE_PROPS = {
  unoptimized: true as const,
};
