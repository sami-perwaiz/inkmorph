/** Figma 40004968:9151 — desktop/tablet navbar tab tokens. */
export const NAV_TAB = {
  paddingX: 16,
  paddingY: 12,
  lineHeight: 18,
  activeBorder: "#202020",
} as const;

export function getNavTabClassName({
  active,
  layout = "inline",
}: {
  active: boolean;
  layout?: "inline" | "stacked";
}): string {
  const isStacked = layout === "stacked";

  return [
    "box-border border-b border-solid font-poppins text-base font-normal leading-[18px] text-black transition-opacity",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
    isStacked
      ? "flex w-full items-center justify-start bg-white text-left"
      : "inline-flex shrink-0 items-center justify-center",
    active
      ? "border-[#202020] opacity-100"
      : "border-transparent opacity-50 hover:opacity-80",
  ].join(" ");
}

export function getNavTabStyle(): {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
} {
  return {
    paddingLeft: NAV_TAB.paddingX,
    paddingRight: NAV_TAB.paddingX,
    paddingTop: NAV_TAB.paddingY,
    paddingBottom: NAV_TAB.paddingY,
  };
}
