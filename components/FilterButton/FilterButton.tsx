"use client";

import { forwardRef } from "react";

import {
  FILTER_ACTIVE_CLASSES,
  FILTER_BUTTON,
  FILTER_INACTIVE_CLASSES,
  type FilterButtonVariant,
} from "@/lib/filterButtonTokens";
import type { FilterValue } from "@/types/illustration";

interface FilterButtonProps {
  label: string;
  category: FilterValue;
  variant: FilterButtonVariant;
  active: boolean;
  onClick: () => void;
  layout?: "inline" | "stacked";
  id?: string;
  controlsId?: string;
}

export const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  function FilterButton(
    {
      label,
      category,
      variant,
      active,
      onClick,
      layout = "inline",
      id,
      controlsId,
    },
    ref
  ) {
    const isStacked = layout === "stacked";
    const colorClasses = active
      ? FILTER_ACTIVE_CLASSES[variant]
      : FILTER_INACTIVE_CLASSES;

    return (
      <button
        ref={ref}
        type="button"
        id={id}
        role="tab"
        data-category={category}
        data-variant={variant}
        aria-selected={active}
        aria-controls={controlsId}
        tabIndex={active ? 0 : -1}
        onClick={onClick}
        className={[
          "motion-filter-tab box-border inline-flex shrink-0 items-center justify-center border border-solid font-poppins font-normal leading-[18px] rounded-[40px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
          isStacked ? "text-base" : "text-xl",
          colorClasses,
        ].join(" ")}
        style={{
          minHeight: FILTER_BUTTON.height,
          paddingTop: FILTER_BUTTON.paddingY,
          paddingBottom: FILTER_BUTTON.paddingY,
          paddingLeft: FILTER_BUTTON.paddingX,
          paddingRight: FILTER_BUTTON.paddingX,
          gap: FILTER_BUTTON.iconTextGap,
          borderRadius: FILTER_BUTTON.radius,
          borderWidth: FILTER_BUTTON.borderWidth,
        }}
      >
        {label}
      </button>
    );
  }
);

export type { FilterButtonVariant };
