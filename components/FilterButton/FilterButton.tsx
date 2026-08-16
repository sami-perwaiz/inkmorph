"use client";

import { forwardRef } from "react";

import {
  FILTER_VALUE_TO_VARIANT,
  type FilterButtonVariant,
} from "@/lib/filterButtonTokens";
import { getNavTabClassName, getNavTabStyle } from "@/lib/navTokens";
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
        className={getNavTabClassName({
          active,
          layout: isStacked ? "stacked" : "inline",
        })}
        style={getNavTabStyle()}
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
export { FILTER_VALUE_TO_VARIANT };
