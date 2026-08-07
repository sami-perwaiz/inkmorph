import type { FilterValue } from "@/types/illustration";

export type FilterButtonVariant =
  | "all"
  | "avatar"
  | "character"
  | "object"
  | "abstract";

export const FILTER_ACTIVE_CLASSES = "text-black";

export const FILTER_INACTIVE_CLASSES = "text-black opacity-50";

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
  paddingY: 12,
  paddingX: 16,
} as const;
