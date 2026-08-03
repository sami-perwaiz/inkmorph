import type { FilterValue } from "@/types/illustration";

export type FilterButtonVariant = "all" | "avatar" | "black-white";

/** Full class strings so Tailwind generates each variant palette. */
export const FILTER_ACTIVE_CLASSES: Record<FilterButtonVariant, string> = {
  all: "bg-filter-all-active-bg border-filter-all-active-border text-filter-all-active-text",
  avatar:
    "bg-filter-avatar-active-bg border-filter-avatar-active-border text-filter-avatar-active-text",
  "black-white":
    "bg-filter-bw-active-bg border-filter-bw-active-border text-filter-bw-active-text",
};

export const FILTER_INACTIVE_CLASSES =
  "bg-white border-filter-inactive-border text-black";

export const FILTER_VALUE_TO_VARIANT: Record<FilterValue, FilterButtonVariant> =
  {
    all: "all",
    "3d-avatar": "avatar",
    "black-white": "black-white",
  };

export const FILTER_BUTTON = {
  height: 42,
  radius: 40,
  borderWidth: 1,
  paddingY: 12,
  paddingX: 16,
  iconTextGap: 10,
} as const;
