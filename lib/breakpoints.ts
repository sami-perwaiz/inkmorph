/** Shared breakpoint values — keep in sync with tailwind.config.ts screens. */
export const BREAKPOINTS = {
  tablet: 768,
  desktop: 1200,
  wide: 1440,
} as const;

export const MEDIA_QUERIES = {
  tablet: `(min-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `(min-width: ${BREAKPOINTS.desktop}px)`,
  wide: `(min-width: ${BREAKPOINTS.wide}px)`,
  /** Primary pointer can hover — desktop nav dropdowns use hover when this matches. */
  hoverFine: "(hover: hover) and (pointer: fine)",
} as const;
