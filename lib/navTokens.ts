/** Shared menu / tab / accordion design tokens — site-wide. */
export const MENU = {
  paddingX: 16,
  paddingY: 12,
  lineHeight: 18,
  activeBorder: "#202020",
  panelBorder: "#E6E6E6",
  panelBackground: "#FFFFFF",
  panelItemColor: "#6F6F6F",
  panelItemSelectedColor: "#111111",
  panelItemSelectedBg: "#F3F3F3",
  panelItemSelectedHoverBg: "#EBEBEB",
  panelWidth: 195,
  panelMinHeight: 96,
  panelPadding: 8,
  panelGap: 8,
  panelRadius: 8,
  panelHoverBg: "#F5F5F5",
  destructiveColor: "#F04438",
  opacityTransition:
    "transition-opacity duration-200 ease-out motion-reduce:transition-none",
  chevronTransition:
    "transition-transform duration-200 ease-out motion-reduce:transition-none",
  accordionTransition:
    "transition-[grid-template-rows] duration-[220ms] ease-out motion-reduce:transition-none",
  dropdownAnimationDuration: 220,
  /** Delay before closing a hover-opened nav dropdown (bridge gap to panel). */
  dropdownHoverCloseDelay: 120,
} as const;

/** CSS class for dropdown panel enter/exit animation — append only, no layout change. */
export const MENU_DROPDOWN_ANIMATION_CLASS = "motion-dropdown-panel";

/** @deprecated Use MENU — kept for existing imports. */
export const NAV_TAB = {
  paddingX: MENU.paddingX,
  paddingY: MENU.paddingY,
  lineHeight: MENU.lineHeight,
  activeBorder: MENU.activeBorder,
} as const;

/** Nav tab visual states: active = black + underline; open = black only; inactive = muted. */
export function isMenuEmphasized(active: boolean, open = false): boolean {
  return active || open;
}

export function getMenuTriggerClassName({
  active,
  open = false,
  layout = "inline",
  withChevron = false,
}: {
  active: boolean;
  open?: boolean;
  layout?: "inline" | "stacked";
  withChevron?: boolean;
}): string {
  const emphasized = isMenuEmphasized(active, open);
  const isStacked = layout === "stacked";

  return [
    "box-border border-b border-solid font-poppins text-base font-normal leading-[18px] text-black",
    "transition-[opacity,border-color] duration-[220ms] ease-out motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
    isStacked
      ? "flex w-full items-center justify-start bg-white text-left"
      : "inline-flex shrink-0 items-center justify-center",
    withChevron && !isStacked ? "gap-2.5" : "",
    emphasized
      ? "opacity-100"
      : "opacity-50 hover:opacity-80",
    active
      ? "border-[#202020]"
      : "border-transparent",
  ].join(" ");
}

/** Nav tab trigger — alias for menu triggers in the navbar and filters. */
export function getNavTabClassName({
  active,
  open = false,
  layout = "inline",
  withChevron = false,
}: {
  active: boolean;
  open?: boolean;
  layout?: "inline" | "stacked";
  withChevron?: boolean;
}): string {
  return getMenuTriggerClassName({ active, open, layout, withChevron });
}

export function getNavTabStyle(): {
  paddingLeft: number;
  paddingRight: number;
  paddingTop: number;
  paddingBottom: number;
} {
  return {
    paddingLeft: MENU.paddingX,
    paddingRight: MENU.paddingX,
    paddingTop: MENU.paddingY,
    paddingBottom: MENU.paddingY,
  };
}

export function getMenuChevronClassName(expanded: boolean): string {
  return [
    "size-4 shrink-0",
    MENU.chevronTransition,
    expanded ? "rotate-180" : "",
  ].join(" ");
}

/** Stacked accordion / mobile sub-item. */
export function getMenuSubItemClassName({
  active,
  destructive = false,
}: {
  active: boolean;
  destructive?: boolean;
}): string {
  return [
    "flex w-full items-center px-4 py-2.5 font-poppins text-base font-normal leading-[18px] outline-none",
    MENU.opacityTransition,
    "focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
    destructive
      ? "text-[#F04438] hover:opacity-80"
      : "text-black",
    active ? "opacity-100" : "opacity-50 hover:opacity-80",
  ].join(" ");
}

/** Shared floating dropdown panel layout — site-wide (Categories, Packs, profile, download). */
export const MENU_DROPDOWN_PANEL_LAYOUT_CLASS =
  "box-border flex w-[195px] min-h-[96px] flex-col gap-2 rounded-[8px] border border-solid border-[#E6E6E6] bg-[#FFFFFF] p-2 shadow-sm";

/** Figma NavigationMenu / Menu Link — 36px row, 8px inset padding. */
export const MENU_DROPDOWN_ITEM_LAYOUT_CLASS =
  "flex w-full min-h-[36px] items-center rounded-[6px] px-2 py-2 font-poppins text-base font-normal leading-[18px]";

export function getMenuDropdownPanelClassName({
  align = "left",
  className = "",
  size = "default",
  position = "below",
}: {
  align?: "left" | "right";
  className?: string;
  /** @deprecated Panel dimensions are unified — size only affects menu item typography. */
  size?: "default" | "compact";
  position?: "below" | "above";
} = {}): string {
  void size;

  return [
    position === "above"
      ? "absolute bottom-[calc(100%+8px)]"
      : "absolute top-[calc(100%+8px)]",
    "z-50",
    MENU_DROPDOWN_PANEL_LAYOUT_CLASS,
    align === "right" ? "right-0" : "left-0",
    className,
  ].join(" ");
}

/** Desktop dropdown menu item. */
export function getMenuDropdownItemClassName({
  active,
  destructive = false,
  premium = false,
  size = "default",
}: {
  active: boolean;
  destructive?: boolean;
  premium?: boolean;
  size?: "default" | "compact";
}): string {
  const sizing =
    size === "compact"
      ? "min-h-[36px] justify-between text-sm leading-5"
      : "";

  return [
    MENU_DROPDOWN_ITEM_LAYOUT_CLASS,
    sizing,
    MENU.opacityTransition,
    "outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
    destructive
      ? "text-[#F04438] hover:bg-[#F5F5F5] hover:opacity-80"
      : premium
        ? active
          ? "bg-[#F3F3F3] font-medium text-[#F5C400] hover:bg-[#EBEBEB]"
          : "text-[#F5C400] hover:bg-[#F5F5F5] hover:opacity-80"
        : active
          ? "bg-[#F3F3F3] font-medium text-[#111111] hover:bg-[#EBEBEB]"
          : "text-[#6F6F6F] hover:bg-[#F5F5F5]",
    premium && !active ? "hover:opacity-80" : "",
  ].join(" ");
}
