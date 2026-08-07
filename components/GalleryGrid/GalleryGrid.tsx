"use client";

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
import { FILTERS } from "@/lib/constants";
import {
  getVisibleGalleryItems,
  type IllustrationFilterLists,
} from "@/lib/filterIllustrations";
import { MOTION } from "@/lib/motion";
import type { FilterValue, Illustration } from "@/types/illustration";

interface GalleryGridProps {
  lists: IllustrationFilterLists;
  activeFilter: FilterValue;
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

/** Matches Tailwind screens: tablet 834 / desktop 1440. */
function useGalleryColumnCount(): number {
  const [columns, setColumns] = useState(3);

  useLayoutEffect(() => {
    const tabletQuery = window.matchMedia("(min-width: 834px)");
    const desktopQuery = window.matchMedia("(min-width: 1440px)");

    const update = () => {
      if (desktopQuery.matches) {
        setColumns(5);
      } else if (tabletQuery.matches) {
        setColumns(4);
      } else {
        setColumns(3);
      }
    };

    update();
    tabletQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    return () => {
      tabletQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  return columns;
}

const GRID_CLASS_NAME =
  "grid w-full grid-cols-3 gap-5 px-4 tablet:grid-cols-4 tablet:px-[50px] desktop:grid-cols-5";

export const GalleryGrid = memo(function GalleryGrid({
  lists,
  activeFilter,
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

  const categoryItems = lists[renderedFilter];
  const illustrations = useMemo(
    () => getVisibleGalleryItems(categoryItems, columnCount),
    [categoryItems, columnCount]
  );
  const isEmpty = categoryItems.length === 0;
  const emptyLabel =
    FILTERS.find((filter) => filter.value === renderedFilter)?.label ??
    "illustrations";
  const hasPaidPeek = illustrations.some((item) => item.premium);

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
        <p className="text-center font-poppins text-xl font-normal leading-6 text-[#797979]">
          No {emptyLabel} illustrations yet
        </p>
        <p className="mt-2 max-w-sm text-center font-poppins text-sm font-normal leading-5 text-[#A9A9A9]">
          Check back soon — new assets are on the way.
        </p>
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
              teaser={Boolean(illustration.premium)}
            />
          ))}
        </section>

        {/* Figma 40004723:10672 — fade over paid peek row (desktop 252) */}
        {showBottomFade && hasPaidPeek ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[66px] bg-gradient-to-b from-transparent to-white tablet:h-[134px] desktop:h-[252px]"
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
