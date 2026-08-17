"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { Footer } from "@/components/Footer/Footer";
import { GalleryGrid } from "@/components/GalleryGrid/GalleryGrid";
import { Navbar } from "@/components/Navbar/Navbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useImagePreviewModal } from "@/hooks/useImagePreviewModal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { trackCategoryChange } from "@/lib/analytics";
import { FILTERS } from "@/lib/constants";
import type { IllustrationFilterLists } from "@/lib/filterIllustrations";
import type { FilterValue } from "@/types/illustration";

const ImagePreviewModal = dynamic(
  () =>
    import("@/components/ImagePreviewModal/ImagePreviewModal").then(
      (module) => ({ default: module.ImagePreviewModal })
    ),
  { ssr: false }
);

interface GalleryProps {
  lists: IllustrationFilterLists;
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

function resolveFilterParam(value: string | null): FilterValue {
  const match = FILTERS.find((filter) => filter.value === value);
  return match?.value ?? "all";
}

export function Gallery({ lists }: GalleryProps) {
  const searchParams = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterValue>(() =>
    resolveFilterParam(searchParams.get("filter"))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
  const isDesktop = useIsDesktop();
  const preview = useImagePreviewModal(isDesktop);
  const skipScrollOnMountRef = useRef(true);

  const handleFilterChange = useCallback((filter: FilterValue) => {
    setActiveFilter((current) => (current === filter ? current : filter));
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  useEffect(() => {
    const next = resolveFilterParam(searchParams.get("filter"));
    setActiveFilter((current) => (current === next ? current : next));
  }, [searchParams]);

  useEffect(() => {
    if (skipScrollOnMountRef.current) {
      skipScrollOnMountRef.current = false;
      return;
    }

    scrollToGalleryTop();
    trackCategoryChange(activeFilter);
  }, [activeFilter]);

  const activeFilterLabel =
    FILTERS.find((filter) => filter.value === activeFilter)?.label ??
    "illustrations";

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
          <ContentContainer>
            <GalleryGrid
              lists={lists}
              activeFilter={activeFilter}
              searchQuery={debouncedSearchQuery}
              isDesktop={isDesktop}
              onPreview={preview.open}
            />
          </ContentContainer>

          <PremiumBanner />
        </main>

        <Footer onFilterChange={handleFilterChange} />

        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Showing {activeFilterLabel}
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
