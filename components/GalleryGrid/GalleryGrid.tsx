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
import {
  getVisibleGalleryItems,
  type IllustrationFilterLists,
} from "@/lib/filterIllustrations";
import { MOTION } from "@/lib/motion";
import { searchGalleryIllustrations } from "@/lib/searchIllustrations";
import type { FilterValue, Illustration } from "@/types/illustration";

interface GalleryGridProps {
  lists: IllustrationFilterLists;
  activeFilter: FilterValue;
  searchQuery?: string;
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

const GRID_CLASS_NAME =
  "grid w-full grid-cols-3 gap-5 px-4 tablet:grid-cols-4 tablet:px-[50px] desktop:grid-cols-4 wide:grid-cols-5";

export const GalleryGrid = memo(function GalleryGrid({
  lists,
  activeFilter,
  searchQuery = "",
  isDesktop,
  onPreview,
  showBottomFade = true,
}: GalleryGridProps) {
  const [renderedFilter, setRenderedFilter] = useState(activeFilter);
  const [isCovered, setIsCovered] = useState(false);
  const isFirstRender = useRef(true);
  const activeFilterRef = useRef(activeFilter);
  const swapTimeoutRef = useRef<number | null>(null);
  const columnCount = useGalleryColumnCount();
  const { hasPremiumAccess, isReady } = usePremiumAccess();

  const categoryItems = lists[renderedFilter];
  const hasActiveSearch = searchQuery.trim().length > 0;
  const matchedItems = useMemo(() => {
    if (!hasActiveSearch) {
      return categoryItems;
    }

    const effectivePremiumAccess = isReady ? hasPremiumAccess : false;

    return searchGalleryIllustrations({
      items: lists[activeFilter],
      query: searchQuery,
      hasPremiumAccess: effectivePremiumAccess,
    });
  }, [
    activeFilter,
    categoryItems,
    hasActiveSearch,
    hasPremiumAccess,
    isReady,
    lists,
    searchQuery,
  ]);
  const illustrations = useMemo(
    () => {
      if (hasActiveSearch) {
        return matchedItems;
      }

      if (activeFilter === "all") {
        return matchedItems.filter((item) => !item.paywalled);
      }

      return getVisibleGalleryItems(matchedItems, columnCount);
    },
    [activeFilter, hasActiveSearch, matchedItems, columnCount]
  );
  const isEmpty = matchedItems.length === 0;
  const emptyLabel =
    FILTERS.find((filter) => filter.value === renderedFilter)?.label ??
    "illustrations";
  const hasPaidPeek =
    !hasActiveSearch && illustrations.some((item) => item.paywalled);

  const priorityIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of illustrations.slice(0, columnCount)) {
      ids.add(item.id);
    }
    return ids;
  }, [illustrations, columnCount]);

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
        {hasActiveSearch ? (
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
              teaser={Boolean(illustration.paywalled)}
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
            "motion-gallery-grid absolute inset-0 z-[3] bg-white",
            isCovered ? "pointer-events-auto" : "pointer-events-none",
            isCovered ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      </div>
    </div>
  );
});
