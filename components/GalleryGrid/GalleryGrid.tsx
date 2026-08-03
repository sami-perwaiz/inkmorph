"use client";

import {
  memo,
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { GalleryCard } from "@/components/GalleryCard/GalleryCard";
import type { IllustrationFilterLists } from "@/lib/filterIllustrations";
import { MOTION } from "@/lib/motion";
import type { FilterValue, Illustration } from "@/types/illustration";

interface GalleryGridProps {
  lists: IllustrationFilterLists;
  activeFilter: FilterValue;
  isDesktop: boolean | null;
  onPreview: (illustration: Illustration) => void;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const GRID_CLASS_NAME =
  "grid grid-cols-3 gap-5 px-4 tablet:grid-cols-4 tablet:px-[50px] desktop:grid-cols-5";

export const GalleryGrid = memo(function GalleryGrid({
  lists,
  activeFilter,
  isDesktop,
  onPreview,
}: GalleryGridProps) {
  const [renderedFilter, setRenderedFilter] = useState(activeFilter);
  const [isCovered, setIsCovered] = useState(false);
  const isFirstRender = useRef(true);
  const activeFilterRef = useRef(activeFilter);
  const swapTimeoutRef = useRef<number | null>(null);

  const illustrations = lists[renderedFilter];

  const priorityIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of lists.all.slice(0, 5)) {
      ids.add(item.id);
    }
    return ids;
  }, [lists]);

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

    // Fade with a white veil instead of opacity on the image grid.
    // Animating ancestor opacity can blank decoded images in Safari/Chrome.
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

  return (
    <div id="illustration-gallery" className="relative">
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
          />
        ))}
      </section>

      <div
        aria-hidden
        className={[
          "motion-gallery-grid absolute inset-0 z-[1] bg-white",
          isCovered ? "pointer-events-auto" : "pointer-events-none",
          isCovered ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </div>
  );
});
