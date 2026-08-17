"use client";

import { useLayoutEffect, useState } from "react";

import { MEDIA_QUERIES } from "@/lib/breakpoints";

/** Matches PackIconGrid: 3 → 4 → 6 → 8 columns. */
export function getPackIconColumnCount(): number {
  if (typeof window === "undefined") {
    return 3;
  }

  if (window.matchMedia(MEDIA_QUERIES.wide).matches) {
    return 8;
  }

  if (window.matchMedia(MEDIA_QUERIES.desktop).matches) {
    return 6;
  }

  if (window.matchMedia(MEDIA_QUERIES.tablet).matches) {
    return 4;
  }

  return 3;
}

/** Matches PackIconGrid: 3 → 4 → 6 → 8 columns. */
export function usePackIconColumnCount(): number {
  const [columns, setColumns] = useState(getPackIconColumnCount);

  useLayoutEffect(() => {
    const tabletQuery = window.matchMedia(MEDIA_QUERIES.tablet);
    const desktopQuery = window.matchMedia(MEDIA_QUERIES.desktop);
    const wideQuery = window.matchMedia(MEDIA_QUERIES.wide);

    const update = () => {
      setColumns(getPackIconColumnCount());
    };

    tabletQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    wideQuery.addEventListener("change", update);

    return () => {
      tabletQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
      wideQuery.removeEventListener("change", update);
    };
  }, []);

  return columns;
}
