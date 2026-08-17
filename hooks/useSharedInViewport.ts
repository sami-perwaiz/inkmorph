"use client";

import { useEffect, useRef, useState } from "react";

import { observeSharedViewport } from "@/lib/sharedIntersectionObserver";
import { isNearViewport } from "@/lib/viewportNear";

/** Shared IntersectionObserver — one instance per page, unobserve after visible. */
export function useSharedInViewport(
  rootMargin: string,
  enabled: boolean
): { ref: React.RefObject<HTMLDivElement | null>; inViewport: boolean } {
  const ref = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(false);

  useEffect(() => {
    if (!enabled || inViewport) {
      return;
    }

    const node = ref.current;
    if (!node) {
      return;
    }

    if (isNearViewport(node, rootMargin)) {
      setInViewport(true);
      return;
    }

    return observeSharedViewport(node, rootMargin, () => {
      setInViewport(true);
    });
  }, [enabled, inViewport, rootMargin]);

  return { ref, inViewport };
}
