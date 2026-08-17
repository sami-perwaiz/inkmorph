"use client";

import { useEffect, useRef, useState } from "react";

import { observeSharedViewport } from "@/lib/sharedIntersectionObserver";

/** Single shared IntersectionObserver — one instance for the whole pack icon grid. */
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

    return observeSharedViewport(node, rootMargin, () => {
      setInViewport(true);
    });
  }, [enabled, inViewport, rootMargin]);

  return { ref, inViewport };
}
