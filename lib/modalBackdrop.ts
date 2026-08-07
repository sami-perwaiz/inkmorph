/** Shared modal scrim — Figma: fill 10% black + background blur 2. */
export const MODAL_BACKDROP = {
  fill: "hsla(0, 0%, 0%, 0.1)",
  blurPx: 2,
} as const;

export function getModalBackdropStyle(): {
  background: string;
  backdropFilter: string;
  WebkitBackdropFilter: string;
} {
  return {
    background: MODAL_BACKDROP.fill,
    backdropFilter: `blur(${MODAL_BACKDROP.blurPx}px)`,
    WebkitBackdropFilter: `blur(${MODAL_BACKDROP.blurPx}px)`,
  };
}
