"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useId, useState } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { FilterTabs } from "@/components/FilterTabs/FilterTabs";
import { GoPremiumButton } from "@/components/GoPremiumButton/GoPremiumButton";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { MenuToggleIcon } from "@/components/MenuToggleIcon/MenuToggleIcon";
import { ProfileMenu } from "@/components/ProfileMenu/ProfileMenu";
import {
  AUTH_CHANGE_EVENT,
  getAuthUser,
  isSignedIn,
  signOut,
} from "@/lib/authSession";
import { NAV } from "@/lib/constants";
import type { FilterValue } from "@/types/illustration";

interface NavbarProps {
  activeFilter: FilterValue | null;
  onFilterChange: (filter: FilterValue) => void;
  pricingActive?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

function PricingNavLink({
  active,
  layout = "inline",
  onNavigate,
}: {
  active: boolean;
  layout?: "inline" | "stacked";
  onNavigate?: () => void;
}) {
  const isStacked = layout === "stacked";

  return (
    <Link
      href="/pricing"
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={[
        "box-border border-b border-solid font-poppins text-base font-normal leading-[18px] text-black transition-opacity",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
        isStacked
          ? "flex w-full items-center justify-start bg-white px-4 py-3 text-left"
          : "inline-flex shrink-0 items-center justify-center px-4 py-3",
        active
          ? "border-[#202020] opacity-100"
          : "border-transparent opacity-50 hover:opacity-80",
      ].join(" ")}
    >
      Pricing
    </Link>
  );
}

/**
 * Desktop: 40004600:8136 / 40004712:10263
 * Tablet:  40004712:10296 / 40004712:10391
 * Mobile:  40004723:10673 / 40004794:11552
 * Open menu: 40004727:10913
 * Open + account: 40004794:11951
 */
const NAVBAR = {
  logoRadius: 6,
  menuIconSize: 24,
} as const;

const ACCOUNT_EMAIL = "";

function SearchField({
  className = "",
  size = "desktop",
  value = "",
  onChange,
}: {
  className?: string;
  size?: "desktop" | "compact";
  value?: string;
  onChange?: (value: string) => void;
}) {
  const isCompact = size === "compact";
  const iconSize = isCompact ? 20 : 24;
  const hasQuery = value.trim().length > 0;

  return (
    <label
      className={[
        "flex items-center rounded-[6px] border border-solid border-[#EAEAEA] bg-white",
        isCompact ? "gap-2 px-2.5 py-2" : "w-full gap-2 px-3 py-2.5",
        className,
      ].join(" ")}
    >
      <span
        className="relative shrink-0"
        style={{ width: iconSize, height: iconSize }}
        aria-hidden
      >
        <Image
          src="/icons/search.svg"
          alt=""
          width={iconSize}
          height={iconSize}
          className="size-full"
        />
      </span>
      <input
        type="search"
        name="q"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Search 3D Assets"
        className={[
          "search-field-input min-w-0 flex-1 bg-transparent font-poppins font-normal text-gray-900 outline-none placeholder:text-[#A9A9A9] placeholder:opacity-80",
          isCompact
            ? "truncate text-sm leading-normal"
            : "text-base leading-6",
        ].join(" ")}
        aria-label="Search 3D Assets"
      />
      {hasQuery ? (
        <button
          type="button"
          aria-label="Clear search"
          className="inline-flex shrink-0 items-center justify-center text-[#A9A9A9] transition-colors hover:text-[#202020] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
          style={{ width: iconSize, height: iconSize }}
          onClick={(event) => {
            event.preventDefault();
            onChange?.("");
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-full"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M18 6l-12 12" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      ) : null}
    </label>
  );
}

/**
 * Account row + expandable menu — collapsed: 40004794:11571
 * Expanded card: 40004794:11951 / 40004794:11984
 */
function AccountMenuSection({ onNavigate }: { onNavigate: () => void }) {
  const [signedIn, setSignedInState] = useState(false);
  const [accountEmail, setAccountEmail] = useState(ACCOUNT_EMAIL);
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const syncAuth = () => {
      const next = isSignedIn();
      setSignedInState(next);
      setAccountEmail(getAuthUser()?.email ?? "");
      if (!next) {
        setExpanded(false);
      }
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  if (!signedIn) {
    return null;
  }

  return (
    <div className="flex w-full flex-col items-stretch gap-2">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
        className={[
          "flex w-full items-center justify-between bg-white px-4 py-3 font-poppins text-base font-normal leading-[18px] text-black",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
          expanded ? "opacity-100" : "opacity-50 hover:opacity-80",
        ].join(" ")}
      >
        <span className="truncate">{accountEmail}</span>
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={16}
          height={16}
          className={[
            "size-4 shrink-0 transition-transform duration-200",
            expanded ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>

      {expanded ? (
        <div
          id={panelId}
          role="menu"
          aria-label="Account"
          className="flex w-full flex-col gap-3 rounded-lg border border-solid border-[#F5F5F5] bg-white p-2"
        >
          <Link
            href="/privacy"
            role="menuitem"
            onClick={onNavigate}
            className="flex w-full items-center rounded-md px-1.5 py-1 font-poppins text-sm font-normal leading-5 text-black outline-none hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-gray-900/30"
          >
            Privacy Policy
          </Link>
          <Link
            href="/signin"
            role="menuitem"
            onClick={() => {
              signOut();
              onNavigate();
            }}
            className="flex w-full items-center rounded-md px-1.5 py-1 font-poppins text-sm font-normal leading-5 text-[#F04438] outline-none hover:bg-[#F5F5F5] focus-visible:bg-[#F5F5F5] focus-visible:ring-2 focus-visible:ring-gray-900/30"
          >
            Logout
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export const Navbar = memo(function Navbar({
  activeFilter,
  onFilterChange,
  pricingActive = false,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isPricingPage = pricingActive || pathname === "/pricing";

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      onFilterChange(filter);
      setIsMenuOpen(false);
    },
    [onFilterChange]
  );

  const galleryFilter = activeFilter ?? "all";

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 w-full border-b border-solid border-[#F5F5F5] bg-white">
      {/* Desktop chrome — Figma 40004712:10263 (shown from laptop width up) */}
      <ContentContainer className="relative hidden laptop:block">
        <div
          className="flex items-center justify-between"
          style={{
            minHeight: NAV.desktopTabletHeight,
            paddingLeft: NAV.desktopTabletPaddingX,
            paddingRight: NAV.desktopTabletPaddingX,
            paddingTop: 24,
            paddingBottom: 20,
          }}
        >
          <div
            className="flex min-w-0 items-center"
            style={{ gap: NAV.logoToFiltersGap }}
          >
            <InkMorphLogo
              size={NAV.logoDesktopTablet}
              radius={NAVBAR.logoRadius}
            />
            <div className="flex items-center" style={{ gap: NAV.filterGap }}>
              <FilterTabs
                activeFilter={isPricingPage ? null : galleryFilter}
                onFilterChange={onFilterChange}
                idPrefix="desktop-filter"
              />
              <PricingNavLink active={isPricingPage} />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            {!isPricingPage ? (
              <SearchField
                className="w-[217px]"
                size="desktop"
                value={searchQuery}
                onChange={onSearchChange}
              />
            ) : null}
            <GoPremiumButton />
            <ProfileMenu />
          </div>
        </div>
      </ContentContainer>

      {/* Mobile + Tablet — closed: 40004794:11552 / open: 40004794:11951 */}
      <div
        className="motion-mobile-nav relative bg-white laptop:hidden"
        data-open={isMenuOpen ? "true" : "false"}
      >
        <button
          type="button"
          className="motion-mobile-backdrop"
          aria-label="Close navigation menu"
          tabIndex={isMenuOpen ? 0 : -1}
          onClick={closeMenu}
        />

        <div className="motion-mobile-panel relative">
          <div className="motion-mobile-header">
            <div className="motion-mobile-header-row flex h-full w-full items-center justify-between px-4 tablet:px-[30px]">
              <InkMorphLogo size={42} radius={NAVBAR.logoRadius} />

              <div className="flex min-w-0 items-center gap-4">
                {!isMenuOpen && !isPricingPage ? (
                  <SearchField
                    size="compact"
                    className="w-[158px] shrink-0 tablet:w-[217px]"
                    value={searchQuery}
                    onChange={onSearchChange}
                  />
                ) : null}
                <button
                  type="button"
                  aria-label={
                    isMenuOpen
                      ? "Close navigation menu"
                      : "Open navigation menu"
                  }
                  aria-expanded={isMenuOpen}
                  onClick={() => setIsMenuOpen((open) => !open)}
                  className="motion-menu-toggle-button relative flex shrink-0 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
                  style={{
                    width: NAVBAR.menuIconSize,
                    height: NAVBAR.menuIconSize,
                  }}
                >
                  <MenuToggleIcon open={isMenuOpen} />
                </button>
              </div>
            </div>
          </div>

          <div
            className="motion-mobile-menu-body px-4 tablet:px-[30px]"
            aria-hidden={!isMenuOpen}
            {...(!isMenuOpen ? { inert: true as const } : {})}
          >
            <div className="motion-mobile-menu-body-inner">
              <div className="motion-mobile-menu-items flex w-full flex-col items-stretch gap-6">
                <div className="flex w-full flex-col items-stretch px-3">
                  <div className="flex w-full flex-col items-stretch gap-5">
                    <FilterTabs
                      activeFilter={isPricingPage ? null : galleryFilter}
                      onFilterChange={handleFilterChange}
                      variant="stacked"
                      idPrefix="compact-filter"
                    />
                    <PricingNavLink
                      active={isPricingPage}
                      layout="stacked"
                      onNavigate={closeMenu}
                    />
                    <AccountMenuSection onNavigate={closeMenu} />
                  </div>
                </div>

                <GoPremiumButton className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
});
