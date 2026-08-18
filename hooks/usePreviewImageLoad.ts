"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
  type SyntheticEvent,
} from "react";

import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";

/** Viewport-gated preview images — handles cache hits and fade-in reveal. */
export function usePreviewImageLoad(
  src: string,
  containerRef: RefObject<HTMLElement | null>,
  enabled = true
) {
  const [isLoaded, setIsLoaded] = useState(() => hasIllustrationImageLoaded(src));
  const [hasError, setHasError] = useState(false);
  const srcRef = useRef(src);

  useEffect(() => {
    if (srcRef.current === src) {
      return;
    }

    srcRef.current = src;
    setIsLoaded(hasIllustrationImageLoaded(src));
    setHasError(false);
  }, [src]);

  const revealImage = useCallback(() => {
    markIllustrationImageLoaded(src);
    setIsLoaded(true);
    setHasError(false);
  }, [src]);

  const handleImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;

      if (!(img.complete && img.naturalWidth > 0)) {
        return;
      }

      if (hasIllustrationImageLoaded(src)) {
        setIsLoaded(true);
        return;
      }

      if (typeof img.decode === "function") {
        img.decode().then(revealImage).catch(revealImage);
        return;
      }

      revealImage();
    },
    [revealImage, src]
  );

  const handleImageError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  /** Cached / unoptimized images may finish before `onLoad` attaches. */
  useLayoutEffect(() => {
    if (!enabled || isLoaded || hasError) {
      return;
    }

    const img = containerRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) {
      revealImage();
    }
  }, [containerRef, enabled, hasError, isLoaded, revealImage, src]);

  return { isLoaded, hasError, handleImageLoad, handleImageError };
}
