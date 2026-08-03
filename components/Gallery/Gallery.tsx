"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ContentContainer } from "@/components/ContentContainer/ContentContainer";
import { DownloadLimitProvider } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { Footer } from "@/components/Footer/Footer";
import { GalleryGrid } from "@/components/GalleryGrid/GalleryGrid";
import { ImagePreviewModal } from "@/components/ImagePreviewModal/ImagePreviewModal";
import { Navbar } from "@/components/Navbar/Navbar";
import { useImagePreviewModal } from "@/hooks/useImagePreviewModal";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import type { IllustrationFilterLists } from "@/lib/filterIllustrations";
import type { FilterValue } from "@/types/illustration";

interface GalleryProps {
  lists: IllustrationFilterLists;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Always return to the top of the page/gallery when switching categories. */
function scrollToGalleryTop() {
  const behavior: ScrollBehavior = prefersReducedMotion() ? "auto" : "smooth";

  window.scrollTo({
    top: 0,
    behavior,
  });
}

export function Gallery({ lists }: GalleryProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const isDesktop = useIsDesktop();
  const preview = useImagePreviewModal(isDesktop);
  const skipScrollOnMountRef = useRef(true);

  const handleFilterChange = useCallback((filter: FilterValue) => {
    setActiveFilter((current) => (current === filter ? current : filter));
  }, []);

  useEffect(() => {
    if (skipScrollOnMountRef.current) {
      skipScrollOnMountRef.current = false;
      return;
    }

    scrollToGalleryTop();
  }, [activeFilter]);

  const activeFilterLabel =
    activeFilter === "all"
      ? "all illustrations"
      : activeFilter === "3d-avatar"
        ? "3D avatar illustrations"
        : "black and white illustrations";

  return (
    <DownloadLimitProvider>
      <div className="min-h-screen bg-white">
        <a
          href="#illustration-gallery"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:text-gray-900 focus:shadow-action-hover focus:outline-none focus:ring-2 focus:ring-gray-900/30"
        >
          Skip to gallery
        </a>

        <Navbar
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

        <main className="pt-[86px] tablet:pt-[148px]">
          <ContentContainer>
            <GalleryGrid
              lists={lists}
              activeFilter={activeFilter}
              isDesktop={isDesktop}
              onPreview={preview.open}
            />
          </ContentContainer>
        </main>

        <Footer
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />

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
    </DownloadLimitProvider>
  );
}
