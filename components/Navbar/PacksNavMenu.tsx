"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  isPacksMenuItemActive,
  isPacksRoute,
  PACKS_NAV_ITEMS,
} from "@/lib/navMenuItems";
import {
  getMenuDropdownItemClassName,
  getMenuDropdownPanelClassName,
  getNavTabClassName,
  getNavTabStyle,
} from "@/lib/navTokens";

/** Figma 40004968:9165 + 40004976:9603 — Packs nav tab with dropdown. */
export function PacksNavMenu({
  layout = "inline",
  onNavigate,
  openAccordion = null,
  onAccordionChange,
}: {
  layout?: "inline" | "stacked";
  onNavigate?: () => void;
  openAccordion?: MobileAccordionId | null;
  onAccordionChange?: (id: MobileAccordionId | null) => void;
}) {
  const pathname = usePathname();
  const menuId = useId();
  const isStacked = layout === "stacked";
  const isActive = isPacksRoute(pathname);
  const isControlled = isStacked && onAccordionChange !== undefined;
  const expanded = isControlled ? openAccordion === "packs" : false;

  const handleToggle = useCallback(() => {
    if (isControlled) {
      onAccordionChange?.(expanded ? null : "packs");
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
          <NavMenuTriggerLabel label="Packs" expanded={expanded} />
        </button>

        <MobileNavAccordionPanel expanded={expanded}>
          {PACKS_NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={
                isPacksMenuItemActive(pathname, href) ? "page" : undefined
              }
              onClick={onNavigate}
              className={getMobileSubNavLinkClassName(
                isPacksMenuItemActive(pathname, href)
              )}
            >
              {label}
            </Link>
          ))}
        </MobileNavAccordionPanel>
      </MobileNavAccordionSection>
    );
  }

  return (
    <PacksNavMenuDesktop
      menuId={menuId}
      pathname={pathname}
      isActive={isActive}
      onNavigate={onNavigate}
    />
  );
}

function PacksNavMenuDesktop({
  menuId,
  pathname,
  isActive,
  onNavigate,
}: {
  menuId: string;
  pathname: string;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const {
    open,
    setActiveDropdown,
    handleTriggerClick,
    handleTriggerKeyDown,
    hoverContainerProps,
    hoverPanelProps,
  } = useNavDropdownHover({ id: "packs" });

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
        Packs
        <NavChevron expanded={open} />
      </button>

      <AnimatedDropdownPanel
        open={open}
        id={menuId}
        label="Packs"
        connected
        className={getMenuDropdownPanelClassName()}
        {...hoverPanelProps}
      >
        {PACKS_NAV_ITEMS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            role="menuitem"
            aria-current={
              isPacksMenuItemActive(pathname, href) ? "page" : undefined
            }
            onClick={() => {
              setActiveDropdown(null);
              onNavigate?.();
            }}
            className={getMenuDropdownItemClassName({
              active: isPacksMenuItemActive(pathname, href),
            })}
          >
            {label}
          </Link>
        ))}
      </AnimatedDropdownPanel>
    </div>
  );
}
