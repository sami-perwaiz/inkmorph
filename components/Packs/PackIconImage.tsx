"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import { useInViewport } from "@/hooks/useInViewport";
import { PACK_ICON } from "@/lib/constants";
import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";

interface PackIconImageProps {
  /** Original asset path — optimized by Next.js for display; downloads use this path directly. */
  src: string;
  alt: string;
  priority?: boolean;
}

function PackIconImageComponent({
  src,
  alt,
  priority = false,
}: PackIconImageProps) {
  const cached = hasIllustrationImageLoaded(src);
  const shouldObserve = !priority && !cached;
  const { ref, inViewport } = useInViewport({
    rootMargin: PACK_ICON.viewportRootMargin,
    enabled: shouldObserve,
  });

  const [isLoaded, setIsLoaded] = useState(cached);
  const [hasError, setHasError] = useState(false);
  const srcRef = useRef(src);

  const shouldFetch = priority || cached || inViewport;

  useEffect(() => {
    if (srcRef.current === src) {
      return;
    }

    srcRef.current = src;
    const wasCached = hasIllustrationImageLoaded(src);
    setIsLoaded(wasCached);
    setHasError(false);
  }, [src]);

  const revealImage = useCallback(() => {
    markIllustrationImageLoaded(src);
    setIsLoaded(true);
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

  return (
    <div ref={ref} className="absolute inset-0">
      {!isLoaded && !hasError ? (
        <div
          className="pack-icon-skeleton pack-icon-skeleton-shimmer absolute inset-0"
          aria-hidden
        />
      ) : null}

      {hasError ? (
        <div
          className="pack-icon-skeleton absolute inset-0"
          role="img"
          aria-label={`${alt} failed to load`}
        />
      ) : null}

      {shouldFetch && !hasError ? (
        <Image
          src={src}
          alt={alt}
          width={PACK_ICON.displaySize}
          height={PACK_ICON.displaySize}
          sizes={PACK_ICON.imageSizes}
          quality={PACK_ICON.previewQuality}
          className={[
            "pack-icon-image gallery-card-image size-full object-contain object-center transition-opacity duration-200 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          {...(priority
            ? { priority: true as const, fetchPriority: "high" as const }
            : {})}
          decoding="async"
          draggable={false}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : null}
    </div>
  );
}

export const PackIconImage = memo(PackIconImageComponent);
