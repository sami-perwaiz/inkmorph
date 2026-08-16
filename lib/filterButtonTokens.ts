import { MENU } from "@/lib/navTokens";
import type { FilterValue } from "@/types/illustration";

export type FilterButtonVariant =
  | "all"
  | "avatar"
  | "character"
  | "object"
  | "abstract";

/** @deprecated Use getNavTabClassName — kept for FilterButton migration. */
export const FILTER_ACTIVE_CLASSES = "text-black opacity-100";

/** @deprecated Use getNavTabClassName — kept for FilterButton migration. */
export const FILTER_INACTIVE_CLASSES =
  "text-black opacity-50 hover:opacity-80 transition-opacity duration-200 ease-out motion-reduce:transition-none";

export const FILTER_VALUE_TO_VARIANT: Record<FilterValue, FilterButtonVariant> =
  {
    all: "all",
    avatar: "avatar",
    character: "character",
    object: "object",
    abstract: "abstract",
  };

export const FILTER_BUTTON = {
  height: 42,
  paddingY: MENU.paddingY,
  paddingX: MENU.paddingX,
} as const;
