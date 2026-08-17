"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewportOptions {
  /** Prefetch when within this distance of the viewport. */
  rootMargin?: string;
  /** When false, skips observation and leaves `inViewport` unchanged. */
  enabled?: boolean;
}

/** Fires once when the observed element enters (or nears) the viewport. */
export function useInViewport({
  rootMargin = "400px",
  enabled = true,
}: UseInViewportOptions = {}) {
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [enabled, inViewport, rootMargin]);

  return { ref, inViewport };
}
