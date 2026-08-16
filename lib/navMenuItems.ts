import type { FilterValue } from "@/types/illustration";

export const CATEGORY_NAV_ITEMS = [
  { filter: "avatar" as const, label: "Avatars" },
  { filter: "character" as const, label: "Characters" },
  { filter: "object" as const, label: "Objects" },
  { filter: "abstract" as const, label: "Abstract" },
] as const;

export const PACKS_NAV_ITEMS = [
  { href: "/packs", label: "Icon Packs" },
  { href: "/wallpapers", label: "iPhone Wallpapers" },
] as const;

const CATEGORY_FILTERS = new Set<FilterValue>(
  CATEGORY_NAV_ITEMS.map((item) => item.filter)
);

export function isCategoryFilter(filter: FilterValue | null): boolean {
  return filter !== null && CATEGORY_FILTERS.has(filter);
}

export function isPacksRoute(pathname: string): boolean {
  return pathname.startsWith("/packs") || pathname.startsWith("/wallpapers");
}

export function isPacksMenuItemActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type DesktopNavPanelId = "categories" | "packs";
