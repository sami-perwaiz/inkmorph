export const LAYOUT = {
  maxWidth: 1440,
} as const;

export const NAV = {
  desktopTabletHeight: 90,
  tabletHeight: 70,
  mobileHeight: 70,
  desktopTabletPaddingX: 30,
  desktopTabletPaddingY: 0,
  mobilePaddingX: 16,
  logoDesktopTablet: 46,
  logoMobile: 40,
  logoToFiltersGap: 24,
  filterGap: 20,
  filterPillPx: 16,
  filterPillPy: 12,
  filterPillRadius: 40,
  mobileMenuGap: 20,
  mobileMenuPaddingX: 12,
  searchWidth: 217,
  profileSize: 44,
} as const;

/** Vertical spacing from preceding content to any CTA section (PremiumBanner). */
export const CTA = {
  sectionGap: 100,
  sectionGapClass: "mt-cta-section",
} as const;

export const GALLERY = {
  gap: 20,
  mobilePaddingX: 16,
  tabletDesktopPaddingX: 50,
  /** Figma content top: mobile 100 / tablet 120 / desktop chrome 138 */
  mobileTopOffset: 100,
  tabletTopOffset: 120,
  desktopTopOffset: 138,
} as const;

/** Pack detail toolbar — flush under fixed navbar (bar height + 1px border). */
export const PACK_DETAIL = {
  headerClearance: 71,
  headerClearanceDesktop: 91,
  /** Toolbar block: 44px row + vertical padding (py-3 mobile / py-5 desktop). */
  toolbarHeight: 68,
  toolbarHeightDesktop: 84,
  toolbarGridGap: 30,
} as const;

/** Shared responsive grid for pack + wallpaper listing pages. */
export const PACK_WALLPAPER_GRID_CLASS =
  "grid w-full min-w-0 grid-cols-1 gap-8 px-4 tablet:grid-cols-2 tablet:px-[50px]";

/** Figma pack/wallpaper thumbnail — 654×400 at desktop two-column width. */
export const PACK_WALLPAPER_THUMB_ASPECT = "654 / 400" as const;

export const PACK_WALLPAPER_THUMB_IMAGE_SIZES =
  "(max-width: 767px) 100vw, 50vw";

export const FOOTER = {
  pt: 64,
  pb: 48,
  mobilePy: 48,
  sectionGap: 64,
  dividerGap: 32,
  innerPaddingX: 50,
  mobilePaddingX: 16,
  linkGap: 16,
  logoSize: 40,
  logoRadius: 4,
  logoBrandGap: 6,
  brandName: "InkMorph",
  copyright: "© 2026 InkMorph. All Rights Reserved.",
} as const;

export const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "avatar" as const, label: "Avatar" },
  { value: "character" as const, label: "Character" },
  { value: "object" as const, label: "Object" },
  { value: "abstract" as const, label: "Abstract" },
];

export const FOOTER_FILTERS = [
  { value: "avatar" as const, label: "Avatar" },
  { value: "character" as const, label: "Character" },
  { value: "object" as const, label: "Object" },
  { value: "abstract" as const, label: "Abstract" },
];

export const ACTION = {
  overlayBlur: 2,
  overlayTint: "rgba(0,0,0,0.04)",
  buttonGap: 20,
  buttonWidth: 150,
  buttonHeight: 42,
  buttonPx: 10,
  buttonPy: 8,
  buttonGapIcon: 8,
  buttonRadius: 8,
  iconSize: 20,
  spinnerSize: 20,
  successResetMs: 1200,
  /** Compact hover controls — Figma 40004699:9280 */
  compactGap: 12,
  compactInset: 16,
  compactRadius: 8,
  compactPx: 12,
  compactPy: 10,
  compactDividerGap: 12,
  premiumBadgeSize: 28,
  premiumBadgeRadius: 6,
  premiumBadgePad: 6,
  premiumCrownSize: 16,
} as const;

export type DownloadSize = "1x" | "2x";
