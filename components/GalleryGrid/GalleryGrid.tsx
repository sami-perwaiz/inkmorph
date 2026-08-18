"use client";

import Image from "next/image";
import {
  memo,
  startTransition,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { GalleryCard } from "@/components/GalleryCard/GalleryCard";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { MEDIA_QUERIES } from "@/lib/breakpoints";
import { FILTERS } from "@/lib/constants";
import { GALLERY_CARD_CLASS, GALLERY_GRID_CLASS } from "@/lib/imageDelivery";
import {
  getVisibleGalleryItems,
  resolveGalleryList,
  type GalleryCatalogData,
} from "@/lib/filterIllustrations";
import { shouldShowPaywalledTeaser } from "@/lib/premiumFeatureAccess";
import { MOTION } from "@/lib/motion";
import { searchGalleryIllustrations } from "@/lib/searchIllustrations";
import type { FilterValue, Illustration } from "@/types/illustration";

interface GalleryGridProps {
  galleryData: GalleryCatalogData;
  activeFilter: FilterValue;
  /** Immediate search input (may lead the debounced query while typing). */
  inputSearchQuery?: string;
  /** Debounced query used to execute search. */
  searchQuery?: string;
  /** True while input differs from the debounced query. */
  isSearchPending?: boolean;
  /** Monotonic generation id for the latest debounced query. */
  searchGeneration?: number;
  isDesktop: boolean | null;
  onPreview: (illustration: Illustration) => void;
  /** Soft white fade over the paid peek row (Figma 40004723:10672). */
  showBottomFade?: boolean;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Matches Tailwind screens: tablet 768 / desktop 1200 / wide 1440. */
function useGalleryColumnCount(): number {
  const [columns, setColumns] = useState(3);

  useLayoutEffect(() => {
    const tabletQuery = window.matchMedia(MEDIA_QUERIES.tablet);
    const wideQuery = window.matchMedia(MEDIA_QUERIES.wide);

    const update = () => {
      if (wideQuery.matches) {
        setColumns(5);
      } else if (tabletQuery.matches) {
        setColumns(4);
      } else {
        setColumns(3);
      }
    };

    update();
    tabletQuery.addEventListener("change", update);
    wideQuery.addEventListener("change", update);
    return () => {
      tabletQuery.removeEventListener("change", update);
      wideQuery.removeEventListener("change", update);
    };
  }, []);

  return columns;
}

const GRID_CLASS_NAME = GALLERY_GRID_CLASS;

function GallerySearchSkeleton({ columnCount }: { columnCount: number }) {
  const placeholders = Math.min(columnCount * 3, 15);

  return (
    <section
      aria-label="Searching illustrations"
      aria-busy="true"
      className={GRID_CLASS_NAME}
    >
      {Array.from({ length: placeholders }, (_, index) => (
        <div key={index} className={GALLERY_CARD_CLASS}>
          <div
            className="gallery-card-skeleton gallery-card-skeleton-shimmer absolute inset-0"
            aria-hidden
          />
        </div>
      ))}
    </section>
  );
}

function GalleryFilterSkeleton({ columnCount }: { columnCount: number }) {
  const placeholders = Math.min(columnCount * 4, 20);

  return (
    <div
      aria-hidden
      className={[GRID_CLASS_NAME, "pointer-events-none"].join(" ")}
    >
      {Array.from({ length: placeholders }, (_, index) => (
        <div key={index} className={GALLERY_CARD_CLASS}>
          <div
            className="gallery-card-skeleton gallery-card-skeleton-shimmer absolute inset-0"
            aria-hidden
          />
        </div>
      ))}
    </div>
  );
}

export const GalleryGrid = memo(function GalleryGrid({
  galleryData,
  activeFilter,
  inputSearchQuery = "",
  searchQuery = "",
  isSearchPending = false,
  searchGeneration = 0,
  isDesktop,
  onPreview,
  showBottomFade = true,
}: GalleryGridProps) {
  const [renderedFilter, setRenderedFilter] = useState(activeFilter);
  const [isCovered, setIsCovered] = useState(false);
  const [searchResults, setSearchResults] = useState<Illustration[]>([]);
  const isFirstRender = useRef(true);
  const activeFilterRef = useRef(activeFilter);
  const swapTimeoutRef = useRef<number | null>(null);
  const columnCount = useGalleryColumnCount();
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const hasFullLibraryAccess = isReady && hasPremiumAccess;

  const { catalog, lists } = galleryData;
  const categoryItems = useMemo(
    () => resolveGalleryList(catalog, lists[renderedFilter]),
    [catalog, lists, renderedFilter]
  );
  const resolvedQuery = searchQuery.trim();
  const hasResolvedSearch = resolvedQuery.length > 0;
  const hasInputSearch = inputSearchQuery.trim().length > 0;

  useEffect(() => {
    if (!hasResolvedSearch) {
      setSearchResults([]);
      return;
    }

    let cancelled = false;
    const effectivePremiumAccess = isReady ? hasPremiumAccess : false;

    const frameId = window.requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }

      const results = searchGalleryIllustrations({
        items: resolveGalleryList(catalog, lists[activeFilter]),
        query: resolvedQuery,
        hasPremiumAccess: effectivePremiumAccess,
        categoryFilter: activeFilter,
      });

      if (cancelled) {
        return;
      }

      setSearchResults(results);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [
    activeFilter,
    catalog,
    hasPremiumAccess,
    hasResolvedSearch,
    isReady,
    lists,
    resolvedQuery,
    searchGeneration,
  ]);

  const matchedItems = hasResolvedSearch ? searchResults : categoryItems;

  const illustrations = useMemo(
    () => {
      if (hasResolvedSearch) {
        return matchedItems;
      }

      if (hasFullLibraryAccess) {
        return matchedItems;
      }

      if (activeFilter === "all") {
        return matchedItems.filter((item) => !item.paywalled);
      }

      return getVisibleGalleryItems(matchedItems, columnCount);
    },
    [
      activeFilter,
      columnCount,
      hasFullLibraryAccess,
      hasResolvedSearch,
      matchedItems,
    ]
  );

  const showSearchLoading =
    isSearchPending && hasInputSearch && searchResults.length === 0;
  const showSearchEmpty =
    !isSearchPending && hasResolvedSearch && searchResults.length === 0;
  const isEmpty = showSearchEmpty;

  const emptyLabel =
    FILTERS.find((filter) => filter.value === renderedFilter)?.label ??
    "illustrations";
  const hasPaidPeek =
    !hasFullLibraryAccess &&
    !hasResolvedSearch &&
    !hasInputSearch &&
    illustrations.some((item) => item.paywalled);

  const priorityIds = useMemo(() => {
    const first = illustrations[0];
    return first ? new Set([first.id]) : new Set<string>();
  }, [illustrations]);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (activeFilter === renderedFilter) {
      return;
    }

    if (swapTimeoutRef.current !== null) {
      window.clearTimeout(swapTimeoutRef.current);
      swapTimeoutRef.current = null;
    }

    const reveal = (filter: FilterValue) => {
      startTransition(() => {
        setRenderedFilter(filter);
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (activeFilterRef.current === filter) {
            setIsCovered(false);
          }
        });
      });
    };

    if (prefersReducedMotion()) {
      setRenderedFilter(activeFilter);
      setIsCovered(false);
      return;
    }

    setIsCovered(true);

    swapTimeoutRef.current = window.setTimeout(() => {
      swapTimeoutRef.current = null;
      reveal(activeFilter);
    }, MOTION.duration.gallery);

    return () => {
      if (swapTimeoutRef.current !== null) {
        window.clearTimeout(swapTimeoutRef.current);
        swapTimeoutRef.current = null;
      }
    };
  }, [activeFilter, renderedFilter]);

  if (showSearchLoading) {
    return (
      <div
        id="illustration-gallery"
        className="relative w-full px-0 py-0"
        aria-busy="true"
      >
        <GallerySearchSkeleton columnCount={columnCount} />
        <div className="sr-only" aria-live="polite">
          Searching illustrations
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div
        id="illustration-gallery"
        className="relative flex w-full flex-col items-center justify-center px-4 py-24 tablet:px-[50px]"
      >
        <div
          aria-hidden
          className={[
            "motion-gallery-grid absolute inset-0 z-[3] bg-white",
            isCovered ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        />
        {showSearchEmpty ? (
          <div className="flex w-full max-w-[476px] flex-col items-center gap-6">
            <div className="relative aspect-[1536/1024] w-full">
              <Image
                src="/search/no-results.png"
                alt=""
                fill
                sizes="(max-width: 767px) 358px, 476px"
                className="object-cover"
                aria-hidden
              />
            </div>
            <div className="flex flex-col items-center gap-1.5 text-center">
              <p className="font-poppins text-xl font-normal leading-normal text-black">
                Hmm, we couldn&apos;t find that.
              </p>
              <p className="font-poppins text-sm font-normal leading-[23px] tracking-[0.14px] text-[#A9A9A9]">
                Try another keyword or explore our collections.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center font-poppins text-xl font-normal leading-6 text-[#797979]">
              {`No ${emptyLabel} illustrations yet`}
            </p>
            <p className="mt-2 max-w-sm text-center font-poppins text-sm font-normal leading-5 text-[#A9A9A9]">
              Check back soon — new assets are on the way.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div id="illustration-gallery" className="relative w-full">
      <div className="relative">
        <section
          aria-label="Illustration gallery"
          aria-busy={isSearchPending && hasInputSearch ? true : undefined}
          className={GRID_CLASS_NAME}
          {...(isCovered ? { inert: true as const } : {})}
        >
          {illustrations.map((illustration) => (
            <GalleryCard
              key={illustration.id}
              illustration={illustration}
              isDesktop={isDesktop}
              onPreview={onPreview}
              priority={priorityIds.has(illustration.id)}
              teaser={shouldShowPaywalledTeaser(
                illustration,
                hasFullLibraryAccess
              )}
            />
          ))}
        </section>

        {/* Figma 40004723:10672 — fade over paid peek row (desktop 252) */}
        {showBottomFade && hasPaidPeek ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[66px] bg-gradient-to-b from-transparent to-white tablet:h-[134px] wide:h-[252px]"
          />
        ) : null}

        <div
          aria-hidden
          className={[
            "motion-gallery-grid absolute inset-0 z-[3]",
            isCovered ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          ].join(" ")}
        >
          {isCovered ? <GalleryFilterSkeleton columnCount={columnCount} /> : null}
        </div>
      </div>

      {isCovered ? (
        <div className="sr-only" aria-live="polite">
          Loading illustrations
        </div>
      ) : null}

      {isSearchPending && hasInputSearch ? (
        <div className="sr-only" aria-live="polite">
          Updating search results
        </div>
      ) : null}
    </div>
  );
});
