"use client";

import { useLayoutEffect, useState } from "react";

import { MEDIA_QUERIES } from "@/lib/breakpoints";

/** Smaller prefetch margins on mobile to reduce off-screen image requests on slow networks. */
const VIEWPORT_MARGINS = {
  mobile: "120px",
  tablet: "200px",
  desktop: "320px",
} as const;

export function useAdaptiveRootMargin(
  initial: string = VIEWPORT_MARGINS.mobile
): string {
  const [margin, setMargin] = useState(initial);

  useLayoutEffect(() => {
    const desktopQuery = window.matchMedia(MEDIA_QUERIES.desktop);
    const tabletQuery = window.matchMedia(MEDIA_QUERIES.tablet);

    const update = () => {
      if (desktopQuery.matches) {
        setMargin(VIEWPORT_MARGINS.desktop);
        return;
      }

      if (tabletQuery.matches) {
        setMargin(VIEWPORT_MARGINS.tablet);
        return;
      }

      setMargin(VIEWPORT_MARGINS.mobile);
    };

    update();
    desktopQuery.addEventListener("change", update);
    tabletQuery.addEventListener("change", update);

    return () => {
      desktopQuery.removeEventListener("change", update);
      tabletQuery.removeEventListener("change", update);
    };
  }, []);

  return margin;
}
