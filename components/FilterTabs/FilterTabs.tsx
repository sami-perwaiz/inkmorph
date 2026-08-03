"use client";

import { useCallback, useMemo, useRef, type KeyboardEvent } from "react";

import { FilterButton } from "@/components/FilterButton/FilterButton";
import { FILTERS, NAV } from "@/lib/constants";
import { FILTER_VALUE_TO_VARIANT } from "@/lib/filterButtonTokens";
import type { FilterValue } from "@/types/illustration";

interface FilterTabsProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
  variant?: "inline" | "stacked";
  controlsId?: string;
  idPrefix?: string;
}

export function FilterTabs({
  activeFilter,
  onFilterChange,
  variant = "inline",
  controlsId = "illustration-gallery",
  idPrefix = "filter",
}: FilterTabsProps) {
  const isStacked = variant === "stacked";
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const focusTab = useCallback((index: number) => {
    const next = tabRefs.current[index];
    next?.focus();
  }, []);

  const filterClickHandlers = useMemo(() => {
    const handlers = {} as Record<FilterValue, () => void>;

    for (const { value } of FILTERS) {
      handlers[value] = () => onFilterChange(value);
    }

    return handlers;
  }, [onFilterChange]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const currentIndex = FILTERS.findIndex(
        (filter) => filter.value === activeFilter
      );

      if (currentIndex === -1) {
        return;
      }

      let nextIndex = currentIndex;

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        nextIndex = (currentIndex + 1) % FILTERS.length;
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        nextIndex = (currentIndex - 1 + FILTERS.length) % FILTERS.length;
      } else if (event.key === "Home") {
        event.preventDefault();
        nextIndex = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        nextIndex = FILTERS.length - 1;
      } else {
        return;
      }

      onFilterChange(FILTERS[nextIndex].value);
      requestAnimationFrame(() => focusTab(nextIndex));
    },
    [activeFilter, focusTab, onFilterChange]
  );

  return (
    <div
      className={
        isStacked
          ? "flex w-full flex-col items-center gap-5"
          : "flex items-center"
      }
      style={isStacked ? undefined : { gap: NAV.filterGap }}
      role="tablist"
      aria-label="Illustration filters"
      onKeyDown={handleKeyDown}
    >
      {FILTERS.map(({ value, label }, index) => (
        <FilterButton
          key={value}
          id={`${idPrefix}-${value}`}
          label={label}
          category={value}
          variant={FILTER_VALUE_TO_VARIANT[value]}
          active={activeFilter === value}
          onClick={filterClickHandlers[value]}
          layout={variant}
          controlsId={controlsId}
          ref={(node) => {
            tabRefs.current[index] = node;
          }}
        />
      ))}
    </div>
  );
}
