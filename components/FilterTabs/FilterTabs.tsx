"use client";

import { FilterButton } from "@/components/FilterButton/FilterButton";
import { FILTERS, NAV } from "@/lib/constants";
import { FILTER_VALUE_TO_VARIANT } from "@/lib/filterButtonTokens";
import type { FilterValue } from "@/types/illustration";

interface FilterTabsProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  variant?: "inline" | "stacked";
}

export function FilterTabs({
  activeFilter,
  onFilterChange,
  variant = "inline",
}: FilterTabsProps) {
  const isStacked = variant === "stacked";

  return (
    <div
      className={
        isStacked
          ? "flex w-full flex-col items-center gap-5"
          : "flex items-center"
      }
      style={isStacked ? undefined : { gap: NAV.filterGap }}
      role="group"
      aria-label="Illustration filters"
    >
      {FILTERS.map(({ value, label }) => (
        <FilterButton
          key={value}
          label={label}
          category={value}
          variant={FILTER_VALUE_TO_VARIANT[value]}
          active={activeFilter === value}
          onClick={() => onFilterChange(value)}
          layout={variant}
        />
      ))}
    </div>
  );
}
