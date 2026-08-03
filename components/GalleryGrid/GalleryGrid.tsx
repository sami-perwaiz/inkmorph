"use client";

import { useEffect, useRef, useState } from "react";

import { GalleryCard } from "@/components/GalleryCard/GalleryCard";
import { MOTION } from "@/lib/motion";
import type { FilterValue, Illustration } from "@/types/illustration";

interface GalleryGridProps {
  illustrations: Illustration[];
  activeFilter: FilterValue;
  isDesktop: boolean | null;
  onPreview: (illustration: Illustration) => void;
}

export function GalleryGrid({
  illustrations,
  activeFilter,
  isDesktop,
  onPreview,
}: GalleryGridProps) {
  const [renderedItems, setRenderedItems] = useState(illustrations);
  const [isVisible, setIsVisible] = useState(true);
  const isFirstRender = useRef(true);
  const activeFilterRef = useRef(activeFilter);

  useEffect(() => {
    activeFilterRef.current = activeFilter;
  }, [activeFilter]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setRenderedItems(illustrations);
      return;
    }

    setIsVisible(false);

    const timeout = window.setTimeout(() => {
      setRenderedItems(illustrations);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (activeFilterRef.current === activeFilter) {
            setIsVisible(true);
          }
        });
      });
    }, MOTION.duration.gallery);

    return () => window.clearTimeout(timeout);
  }, [illustrations, activeFilter]);

  return (
    <section
      aria-label="Illustration gallery"
      className={[
        "motion-gallery-grid grid grid-cols-3 gap-5 px-4 tablet:grid-cols-4 tablet:px-[50px] desktop:grid-cols-5",
        isVisible ? "opacity-100" : "opacity-0",
      ].join(" ")}
    >
      {renderedItems.map((illustration) => (
        <GalleryCard
          key={illustration.id}
          illustration={illustration}
          isDesktop={isDesktop}
          onPreview={onPreview}
        />
      ))}
    </section>
  );
}
