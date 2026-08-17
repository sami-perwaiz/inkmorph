"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useId, useLayoutEffect, useState } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { GoPremiumButton } from "@/components/GoPremiumButton/GoPremiumButton";
import { useLegalNavigation } from "@/hooks/useLegalNavigation";
import { AllNavLink } from "@/components/Navbar/AllNavLink";
import { CategoriesNavMenu } from "@/components/Navbar/CategoriesNavMenu";
import {
  MobileNavAccordionPanel,
  MobileNavAccordionSection,
  MOBILE_ACCORDION_TRIGGER_CLASS,
  type MobileAccordionId,
} from "@/components/Navbar/MobileNavAccordion";
import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { MenuToggleIcon } from "@/components/MenuToggleIcon/MenuToggleIcon";
import { NavDropdownProvider } from "@/components/Navbar/NavDropdownContext";
import { PacksNavMenu } from "@/components/Navbar/PacksNavMenu";
import { NavMenuTriggerLabel } from "@/components/Navbar/NavMenuTriggerLabel";
import { ProfileMenu } from "@/components/ProfileMenu/ProfileMenu";
import {
  AUTH_CHANGE_EVENT,
  getAuthUser,
  isSignedIn,
  signOut,
} from "@/lib/authSession";
import { NAV } from "@/lib/constants";
import { isLegalPagePath } from "@/lib/legalScroll";
import { MEDIA_QUERIES } from "@/lib/breakpoints";
import {
  getMenuSubItemClassName,
  getNavTabClassName,
  getNavTabStyle,
} from "@/lib/navTokens";
import { PROFILE_CHANGE_EVENT, readUserProfile } from "@/lib/userProfile";
import type { FilterValue } from "@/types/illustration";

interface NavbarProps {
  activeFilter: FilterValue | null;
  onFilterChange: (filter: FilterValue) => void;
  pricingActive?: boolean;
  packsActive?: boolean;
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

  const link = (
    <Link
      href="/pricing"
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={[
        getNavTabClassName({ active, layout: isStacked ? "stacked" : "inline" }),
        isStacked ? MOBILE_ACCORDION_TRIGGER_CLASS : "",
      ].join(" ")}
      style={getNavTabStyle()}
    >
      Pricing
    </Link>
  );

  if (isStacked) {
    return (
      <MobileNavAccordionSection expanded={false} emphasized={active}>
        {link}
      </MobileNavAccordionSection>
    );
  }

  return link;
}

/**
 * Desktop/tablet: Figma 40004968:9151
 * Mobile menu: 40004794:11552 / 40004794:11951
 */
const NAVBAR = {
  logoRadius: 6,
  menuIconSize: 24,
} as const;

function AccountMenuSection({
  onNavigate,
  openAccordion,
  onAccordionChange,
}: {
  onNavigate: () => void;
  openAccordion: MobileAccordionId | null;
  onAccordionChange: (id: MobileAccordionId | null) => void;
}) {
  const [signedIn, setSignedInState] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const panelId = useId();
  const expanded = openAccordion === "account";
  const handleLegalLinkClick = useLegalNavigation();

  useEffect(() => {
    const syncAuth = () => {
      const next = isSignedIn();
      setSignedInState(next);

      if (!next) {
        return;
      }

      const profile = readUserProfile();
      const authUser = getAuthUser();
      setDisplayName(
        profile.fullName || authUser?.name || authUser?.email || "Account"
      );
    };

    syncAuth();
    window.addEventListener(AUTH_CHANGE_EVENT, syncAuth);
    window.addEventListener(PROFILE_CHANGE_EVENT, syncAuth);
    window.addEventListener("storage", syncAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, syncAuth);
      window.removeEventListener(PROFILE_CHANGE_EVENT, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  if (!signedIn) {
    return null;
  }

  return (
    <MobileNavAccordionSection expanded={expanded} emphasized={expanded}>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => onAccordionChange(expanded ? null : "account")}
        className={[
          getNavTabClassName({
            active: false,
            open: expanded,
            layout: "stacked",
          }),
          MOBILE_ACCORDION_TRIGGER_CLASS,
        ].join(" ")}
        style={getNavTabStyle()}
      >
        <NavMenuTriggerLabel label={displayName} expanded={expanded} />
      </button>

      <MobileNavAccordionPanel expanded={expanded}>
        <div id={panelId} role="menu" aria-label="Account">
          <Link
            href="/complete-profile"
            role="menuitem"
            onClick={onNavigate}
            className={getMenuSubItemClassName({ active: false })}
          >
            Edit profile
          </Link>
          <Link
            href="/privacy"
            role="menuitem"
            scroll={false}
            onClick={() => {
              handleLegalLinkClick();
              onNavigate();
            }}
            className={getMenuSubItemClassName({ active: false })}
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
            className={getMenuSubItemClassName({ active: false, destructive: true })}
          >
            Logout
          </Link>
        </div>
      </MobileNavAccordionPanel>
    </MobileNavAccordionSection>
  );
}
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
        isCompact ? "min-w-0 gap-2 px-2.5 py-2" : "w-full gap-2 px-3 py-2.5",
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

export const Navbar = memo(function Navbar({
  activeFilter,
  onFilterChange,
  pricingActive = false,
  packsActive = false,
  searchQuery = "",
  onSearchChange,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<MobileAccordionId | null>(
    null
  );
  const isPricingPage = pricingActive || pathname === "/pricing";
  const isPacksPage =
    packsActive ||
    pathname.startsWith("/packs") ||
    pathname.startsWith("/wallpapers");
  const isLegalPage = isLegalPagePath(pathname);
  const showSearch = !isPricingPage && !isPacksPage && !isLegalPage;
  const showGalleryFilters = !isPricingPage && !isPacksPage;

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const handleAccordionChange = useCallback((id: MobileAccordionId | null) => {
    setOpenAccordion(id);
  }, []);

  const galleryFilter = activeFilter ?? (isLegalPage ? null : "all");
  const isAllActive = showGalleryFilters && galleryFilter === "all";

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERIES.desktop);
    const resetOnDesktop = () => {
      if (mediaQuery.matches) {
        setIsMenuOpen(false);
        setOpenAccordion(null);
      }
    };

    resetOnDesktop();
    mediaQuery.addEventListener("change", resetOnDesktop);
    return () => mediaQuery.removeEventListener("change", resetOnDesktop);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      setOpenAccordion(null);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  return (
    <header
      className="motion-navbar-header fixed inset-x-0 top-0 z-50 w-full bg-white"
      data-mobile-menu-open={isMenuOpen ? "true" : "false"}
    >
      {/* Desktop chrome — Figma 40004968:9151 (1200px+) */}
      <ContentContainer className="relative hidden desktop:block">
        <NavDropdownProvider>
          <div
            className="flex items-center justify-between gap-4"
            style={{
              minHeight: NAV.desktopTabletHeight,
              paddingLeft: NAV.desktopTabletPaddingX,
              paddingRight: NAV.desktopTabletPaddingX,
              paddingTop: 24,
              paddingBottom: 20,
            }}
          >
            <div
              className="flex min-w-0 flex-1 items-center"
              style={{ gap: NAV.logoToFiltersGap }}
            >
              <InkMorphLogo
                size={NAV.logoDesktopTablet}
                radius={NAVBAR.logoRadius}
              />
              <div className="flex min-w-0 items-center gap-4 desktop:gap-5">
                <AllNavLink active={isAllActive} />
                <CategoriesNavMenu
                  activeFilter={showGalleryFilters ? galleryFilter : null}
                  showGalleryFilters={showGalleryFilters}
                />
                <PacksNavMenu />
                <PricingNavLink active={isPricingPage} />
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 desktop:gap-4">
              {showSearch ? (
                <SearchField
                  className="w-[clamp(10rem,18vw,13.5625rem)]"
                  size="desktop"
                  value={searchQuery}
                  onChange={onSearchChange}
                />
              ) : null}
              <GoPremiumButton />
              <ProfileMenu />
            </div>
          </div>
        </NavDropdownProvider>
      </ContentContainer>

      {/* Mobile — closed: 40004794:11552 / open: 40004794:11951 */}
      <div
        className="motion-mobile-nav relative bg-white desktop:hidden"
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
            <div className="motion-mobile-header-row flex h-full w-full min-w-0 items-center gap-2 px-4 tablet:gap-3 tablet:px-[30px]">
              <InkMorphLogo size={42} radius={NAVBAR.logoRadius} />

              <div className="flex min-w-0 flex-1 items-center justify-end gap-2 tablet:gap-3">
                {!isMenuOpen && showSearch ? (
                  <SearchField
                    size="compact"
                    className="min-w-0 w-full max-w-[min(13.5625rem,calc(100vw-5.75rem))] tablet:max-w-[13.5625rem]"
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
                <div className="flex w-full flex-col items-stretch gap-5">
                    <AllNavLink
                      active={isAllActive}
                      layout="stacked"
                      onNavigate={closeMenu}
                    />
                    <CategoriesNavMenu
                      layout="stacked"
                      activeFilter={showGalleryFilters ? galleryFilter : null}
                      showGalleryFilters={showGalleryFilters}
                      onNavigate={closeMenu}
                      openAccordion={openAccordion}
                      onAccordionChange={handleAccordionChange}
                    />
                    <PacksNavMenu
                      layout="stacked"
                      onNavigate={closeMenu}
                      openAccordion={openAccordion}
                      onAccordionChange={handleAccordionChange}
                    />
                    <PricingNavLink
                      active={isPricingPage}
                      layout="stacked"
                      onNavigate={closeMenu}
                    />
                    <AccountMenuSection
                      onNavigate={closeMenu}
                      openAccordion={openAccordion}
                      onAccordionChange={handleAccordionChange}
                    />
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
