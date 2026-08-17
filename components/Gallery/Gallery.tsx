"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { Footer } from "@/components/Footer/Footer";
import { GalleryGrid } from "@/components/GalleryGrid/GalleryGrid";
import { Navbar } from "@/components/Navbar/Navbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { useLiveSearch } from "@/hooks/useLiveSearch";
import { useImagePreviewModal } from "@/hooks/useImagePreviewModal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { trackCategoryChange } from "@/lib/analytics";
import { FILTERS } from "@/lib/constants";
import type { GalleryCatalogData } from "@/lib/filterIllustrations";
import {
  getSavedSearchQuery,
  savePageSearch,
} from "@/lib/legalScroll";
import { filterFromPathname, getCategoryHref } from "@/lib/seo/routes";
import type { FilterValue } from "@/types/illustration";

const ImagePreviewModal = dynamic(
  () =>
    import("@/components/ImagePreviewModal/ImagePreviewModal").then(
      (module) => ({ default: module.ImagePreviewModal })
    ),
  { ssr: false }
);

interface GalleryProps {
  galleryData: GalleryCatalogData;
  initialFilter?: FilterValue;
  seoIntro?: string;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToGalleryTop() {
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

  window.scrollTo({
    top: 0,
    behavior,
  });
}

export function Gallery({
  galleryData,
  initialFilter = "all",
  seoIntro,
}: GalleryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const routeFilter = filterFromPathname(pathname);
  const [activeFilter, setActiveFilter] = useState<FilterValue>(
    routeFilter !== "all" ? routeFilter : initialFilter
  );
  const [searchQuery, setSearchQuery] = useState("");
  const restoredSearchForPathRef = useRef<string | null>(null);
  const {
    debouncedQuery: debouncedSearchQuery,
    isPending: isSearchPending,
    generation: searchGeneration,
  } = useLiveSearch(searchQuery, 180);
  const isDesktop = useIsDesktop();
  const preview = useImagePreviewModal(isDesktop);
  const skipScrollOnMountRef = useRef(true);
  const previousFilterRef = useRef(activeFilter);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      const href = getCategoryHref(filter);
      if (pathname !== href) {
        router.push(href);
      }
    },
    [pathname, router]
  );

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    if (restoredSearchForPathRef.current === pathname) {
      return;
    }

    restoredSearchForPathRef.current = pathname;
    setSearchQuery(getSavedSearchQuery(pathname));
  }, [pathname]);

  useEffect(() => {
    savePageSearch(pathname, searchQuery);
  }, [pathname, searchQuery]);

  useEffect(() => {
    const nextFilter =
      routeFilter !== "all" ? routeFilter : initialFilter;
    setActiveFilter((current) =>
      current === nextFilter ? current : nextFilter
    );
  }, [initialFilter, routeFilter]);

  useEffect(() => {
    if (skipScrollOnMountRef.current) {
      skipScrollOnMountRef.current = false;
      previousFilterRef.current = activeFilter;
      return;
    }

    if (previousFilterRef.current === activeFilter) {
      return;
    }

    previousFilterRef.current = activeFilter;
    scrollToGalleryTop();
    trackCategoryChange(activeFilter);
  }, [activeFilter]);

  const activeFilterLabel =
    FILTERS.find((filter) => filter.value === activeFilter)?.label ??
    "illustrations";

  const hasSearchQuery = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen w-full bg-white">
      <a
        href="#illustration-gallery"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-gray-900 focus:shadow-action-hover focus:outline-none focus:ring-2 focus:ring-gray-900/30"
      >
        Skip to gallery
      </a>

      <Navbar
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <main className="flex w-full flex-col pt-[100px] tablet:pt-[120px] desktop:pt-[138px]">
        {seoIntro ? (
          <p className="sr-only">{seoIntro}</p>
        ) : null}

        <ContentContainer>
          <GalleryGrid
            galleryData={galleryData}
            activeFilter={activeFilter}
            inputSearchQuery={searchQuery}
            searchQuery={debouncedSearchQuery}
            isSearchPending={isSearchPending}
            searchGeneration={searchGeneration}
            isDesktop={isDesktop}
            onPreview={preview.open}
          />
        </ContentContainer>

        <PremiumBanner />
      </main>

      <Footer onFilterChange={handleFilterChange} />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {hasSearchQuery
          ? `Searching ${activeFilterLabel} illustrations`
          : `Showing ${activeFilterLabel} illustrations`}
      </div>

      {preview.isMounted && preview.illustration && (
        <ImagePreviewModal
          illustration={preview.illustration}
          visible={preview.visible}
          onClose={preview.close}
          onExitComplete={preview.completeExit}
        />
      )}
    </div>
  );
}
