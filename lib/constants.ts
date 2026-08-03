export const LAYOUT = {
  maxWidth: 1440,
} as const;

export const NAV = {
  desktopTabletHeight: 98,
  mobileHeight: 66,
  desktopTabletPaddingX: 50,
  desktopTabletPaddingY: 16,
  mobilePaddingX: 16,
  logoDesktopTablet: 66,
  logoMobile: 46,
  logoToFiltersGap: 24,
  filterGap: 20,
  filterPillPx: 16,
  filterPillPy: 12,
  filterPillRadius: 40,
  mobileMenuGap: 20,
  mobileMenuPaddingX: 12,
} as const;

export const GALLERY = {
  gap: 20,
  mobilePaddingX: 16,
  tabletDesktopPaddingX: 50,
  mobileTopOffset: 86,
  tabletDesktopTopOffset: 148,
} as const;

export const FOOTER = {
  pt: 64,
  pb: 48,
  sectionGap: 64,
  dividerGap: 32,
  innerPaddingX: 32,
  mobilePaddingX: 20,
  linkGap: 32,
  logoSize: 40,
  logoRadius: 4,
  logoBrandGap: 6,
  brandName: "InkMorph",
  copyright: "© 2025 inkmorph. All Rights Reserved.",
} as const;

export const FILTERS = [
  { value: "all" as const, label: "All" },
  { value: "3d-avatar" as const, label: "3D Avatar" },
  { value: "black-white" as const, label: "Black & White" },
];

export const FOOTER_FILTERS = [
  { value: "3d-avatar" as const, label: "3D Avatars" },
  { value: "black-white" as const, label: "Black & White" },
];

export const ACTION = {
  overlayBlur: 4,
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
} as const;
