"use client";

import { useLayoutEffect, useState } from "react";

import { MEDIA_QUERIES } from "@/lib/breakpoints";

/** True when the primary pointer supports hover (mouse/trackpad). */
export function usePrefersHover(): boolean | null {
  const [prefersHover, setPrefersHover] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(MEDIA_QUERIES.hoverFine);
    const update = () => setPrefersHover(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersHover;
}
