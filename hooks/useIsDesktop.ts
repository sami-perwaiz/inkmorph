"use client";

import { useLayoutEffect, useState } from "react";

import { MEDIA_QUERIES } from "@/lib/breakpoints";

/** Desktop interactions (hover overlay, etc.) — ≥1200px */
const DESKTOP_QUERY = MEDIA_QUERIES.desktop;

export function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isDesktop;
}
