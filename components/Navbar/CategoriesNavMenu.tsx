"use client";

import Link from "next/link";
import {
  useCallback,
  useId,
} from "react";

import { AnimatedDropdownPanel } from "@/components/AnimatedDropdownPanel/AnimatedDropdownPanel";
import {
  getMobileSubNavLinkClassName,
  MobileNavAccordionPanel,
  MobileNavAccordionSection,
  MOBILE_ACCORDION_TRIGGER_CLASS,
  type MobileAccordionId,
} from "@/components/Navbar/MobileNavAccordion";
import { NavChevron } from "@/components/Navbar/NavChevron";
import { NavMenuTriggerLabel } from "@/components/Navbar/NavMenuTriggerLabel";
import { useNavDropdownHover } from "@/components/Navbar/useNavDropdownHover";
import {
  CATEGORY_NAV_ITEMS,
  isCategoryFilter,
} from "@/lib/navMenuItems";
import { getCategoryHref } from "@/lib/seo/routes";
import {
  getMenuDropdownItemClassName,
  getMenuDropdownPanelClassName,
  getNavTabClassName,
  getNavTabStyle,
} from "@/lib/navTokens";
import type { FilterValue } from "@/types/illustration";

/** Categories nav tab with dropdown — Avatars, Characters, Objects, Abstract. */
export function CategoriesNavMenu({
  layout = "inline",
  activeFilter,
  showGalleryFilters,
  onNavigate,
  openAccordion = null,
  onAccordionChange,
}: {
  layout?: "inline" | "stacked";
  activeFilter: FilterValue | null;
  showGalleryFilters: boolean;
  onNavigate?: () => void;
  openAccordion?: MobileAccordionId | null;
  onAccordionChange?: (id: MobileAccordionId | null) => void;
}) {
  const menuId = useId();
  const isStacked = layout === "stacked";
  const isActive = showGalleryFilters && isCategoryFilter(activeFilter);
  const isControlled = isStacked && onAccordionChange !== undefined;
  const expanded = isControlled ? openAccordion === "categories" : false;

  const handleToggle = useCallback(() => {
    if (isControlled) {
      onAccordionChange?.(expanded ? null : "categories");
    }
  }, [expanded, isControlled, onAccordionChange]);

  if (isStacked) {
    return (
      <MobileNavAccordionSection
        expanded={expanded}
        emphasized={isActive || expanded}
      >
        <button
          type="button"
          aria-expanded={expanded}
          onClick={handleToggle}
          className={[
            getNavTabClassName({
              active: isActive,
              open: expanded,
              layout: "stacked",
            }),
            MOBILE_ACCORDION_TRIGGER_CLASS,
          ].join(" ")}
          style={getNavTabStyle()}
        >
          <NavMenuTriggerLabel label="Categories" expanded={expanded} />
        </button>

        <MobileNavAccordionPanel expanded={expanded}>
          {CATEGORY_NAV_ITEMS.map(({ filter, label }) => (
            <Link
              key={filter}
              href={getCategoryHref(filter)}
              aria-current={
                showGalleryFilters && activeFilter === filter ? "page" : undefined
              }
              onClick={onNavigate}
              className={getMobileSubNavLinkClassName(
                showGalleryFilters && activeFilter === filter
              )}
            >
              {label}
            </Link>
          ))}
        </MobileNavAccordionPanel>
      </MobileNavAccordionSection>
    );
  }

  return <CategoriesNavMenuDesktop {...{ menuId, isActive, showGalleryFilters, activeFilter, onNavigate }} />;
}

function CategoriesNavMenuDesktop({
  menuId,
  isActive,
  showGalleryFilters,
  activeFilter,
  onNavigate,
}: {
  menuId: string;
  isActive: boolean;
  showGalleryFilters: boolean;
  activeFilter: FilterValue | null;
  onNavigate?: () => void;
}) {
  const {
    open,
    setActiveDropdown,
    handleTriggerClick,
    handleTriggerKeyDown,
    hoverContainerProps,
    hoverPanelProps,
  } = useNavDropdownHover({ id: "categories" });

  return (
    <div className="relative" {...hoverContainerProps}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        className={getNavTabClassName({
          active: isActive,
          open,
          withChevron: true,
        })}
        style={getNavTabStyle()}
      >
        Categories
        <NavChevron expanded={open} />
      </button>

      <AnimatedDropdownPanel
        open={open}
        id={menuId}
        label="Categories"
        connected
        className={getMenuDropdownPanelClassName()}
        {...hoverPanelProps}
      >
        {CATEGORY_NAV_ITEMS.map(({ filter, label }) => (
          <Link
            key={filter}
            href={getCategoryHref(filter)}
            role="menuitem"
            aria-current={
              showGalleryFilters && activeFilter === filter ? "page" : undefined
            }
            onClick={() => {
              setActiveDropdown(null);
              onNavigate?.();
            }}
            className={getMenuDropdownItemClassName({
              active: showGalleryFilters && activeFilter === filter,
            })}
          >
            {label}
          </Link>
        ))}
      </AnimatedDropdownPanel>
    </div>
  );
}
