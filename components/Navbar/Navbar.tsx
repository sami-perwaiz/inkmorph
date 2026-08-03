"use client";

import Image from "next/image";
import { useState } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { FilterTabs } from "@/components/FilterTabs/FilterTabs";
import { MenuToggleIcon } from "@/components/MenuToggleIcon/MenuToggleIcon";
import { NAV } from "@/lib/constants";
import type { FilterValue } from "@/types/illustration";

interface NavbarProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

/** Figma node 40004541:8469 — desktop/tablet navbar. */
const NAVBAR = {
  contentRowHeight: 66,
  logoDesktopRadius: 12,
  logoMobileRadius: 8,
  logoOverlay: "rgba(255, 255, 255, 0.2)",
  mobileContentRowHeight: 46,
  menuIconSize: 24,
  mobileOpenRadius: 12,
} as const;

function Logo({
  size,
  radius,
  frosted = true,
}: {
  size: number;
  radius: number;
  frosted?: boolean;
}) {
  if (!frosted) {
    return (
      <div
        className="relative shrink-0 overflow-hidden"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <Image
          src="/logo.png"
          alt="Site logo"
          fill
          className="object-cover"
          priority
        />
      </div>
    );
  }

  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: radius, backgroundColor: NAVBAR.logoOverlay }}
        aria-hidden
      />
      <div
        className="absolute inset-0 overflow-hidden backdrop-blur-[5px] [-webkit-backdrop-filter:blur(5px)]"
        style={{ borderRadius: radius }}
      >
        <Image
          src="/logo.png"
          alt="Site logo"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}

export function Navbar({ activeFilter, onFilterChange }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleFilterChange = (filter: FilterValue) => {
    onFilterChange(filter);
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white">
      {/* Desktop & Tablet — Figma 40004541:8469 */}
      <ContentContainer className="relative hidden tablet:block">
        <div
          style={{
            height: NAV.desktopTabletHeight,
            paddingLeft: NAV.desktopTabletPaddingX,
            paddingRight: NAV.desktopTabletPaddingX,
            paddingTop: NAV.desktopTabletPaddingY,
            paddingBottom: NAV.desktopTabletPaddingY,
          }}
        >
          <div
            className="relative flex items-center"
            style={{
              height: NAVBAR.contentRowHeight,
              gap: NAV.logoToFiltersGap,
            }}
          >
            <Logo size={NAV.logoDesktopTablet} radius={NAVBAR.logoDesktopRadius} />
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={onFilterChange}
            />
          </div>
        </div>
      </ContentContainer>

      {/* Mobile — fixed header row + expanding menu panel */}
      <div
        className="motion-mobile-nav relative bg-white tablet:hidden"
        data-open={isMenuOpen ? "true" : "false"}
      >
        <button
          type="button"
          className="motion-mobile-backdrop"
          aria-label="Close navigation menu"
          tabIndex={isMenuOpen ? 0 : -1}
          onClick={() => setIsMenuOpen(false)}
        />

        <div className="motion-mobile-panel relative">
          <div
            className="motion-mobile-header"
            style={{
              paddingLeft: NAV.mobilePaddingX,
              paddingRight: NAV.mobilePaddingX,
            }}
          >
            <div
              className="motion-mobile-header-row flex w-full items-center justify-between"
              style={{ height: NAVBAR.mobileContentRowHeight }}
            >
              <Logo
                size={NAV.logoMobile}
                radius={NAVBAR.logoMobileRadius}
                frosted
              />
              <button
                type="button"
                aria-label={
                  isMenuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className="motion-menu-toggle-button relative flex shrink-0 items-center justify-center"
                style={{
                  width: NAVBAR.menuIconSize,
                  height: NAVBAR.menuIconSize,
                }}
              >
                <MenuToggleIcon open={isMenuOpen} />
              </button>
            </div>
          </div>

          <div
            className="motion-mobile-menu-body"
            aria-hidden={!isMenuOpen}
            {...(!isMenuOpen ? { inert: true as const } : {})}
            style={{
              paddingLeft: NAV.mobilePaddingX,
              paddingRight: NAV.mobilePaddingX,
            }}
          >
            <div className="motion-mobile-menu-body-inner">
              <div
                className="motion-mobile-menu-items w-full [&_button]:w-full [&_button]:text-center"
                style={{
                  paddingLeft: NAV.mobileMenuPaddingX,
                  paddingRight: NAV.mobileMenuPaddingX,
                }}
              >
                <FilterTabs
                  activeFilter={activeFilter}
                  onFilterChange={handleFilterChange}
                  variant="stacked"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
