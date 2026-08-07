"use client";

import { useLayoutEffect, useState } from "react";

/** Figma desktop gallery / hover — 1440px */
const DESKTOP_QUERY = "(min-width: 1440px)";

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
