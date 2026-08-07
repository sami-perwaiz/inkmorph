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

    return (
      <button
        ref={ref}
        type="button"
        id={id}
        role="tab"
        data-category={category}
        data-variant={variant}
        data-layout={layout}
        aria-selected={active}
        aria-controls={controlsId}
        tabIndex={active ? 0 : -1}
        onClick={onClick}
        className={[
          "motion-filter-tab box-border border-b border-solid font-poppins text-base font-normal leading-[18px]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
          isStacked
            ? "flex w-full items-center justify-start text-left"
            : "inline-flex shrink-0 items-center justify-center",
          active ? FILTER_ACTIVE_CLASSES : FILTER_INACTIVE_CLASSES,
          active ? "border-[#202020]" : "border-transparent",
        ].join(" ")}
        style={{
          minHeight: FILTER_BUTTON.height,
          paddingTop: FILTER_BUTTON.paddingY,
          paddingBottom: FILTER_BUTTON.paddingY,
          paddingLeft: FILTER_BUTTON.paddingX,
          paddingRight: FILTER_BUTTON.paddingX,
        }}
      >
        {isStacked && active ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full bg-black"
            />
            {label}
          </span>
        ) : (
          label
        )}
      </button>
    );
  }
);

export type { FilterButtonVariant };
