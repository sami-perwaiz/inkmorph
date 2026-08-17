"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";

import { useAdaptiveRootMargin } from "@/hooks/useAdaptiveRootMargin";
import { useSharedInViewport } from "@/hooks/useSharedInViewport";
import { GALLERY } from "@/lib/constants";
import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";
import { IMAGE_PREVIEW_QUALITY, PREVIEW_IMAGE_PROPS } from "@/lib/imageDelivery";

interface LazyImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  sizes: string;
  priority?: boolean;
  /** Applied to the `<img>` element (object-fit, opacity transitions, etc.). */
  className?: string;
  quality?: number;
}

/** Optimized browse preview with skeleton placeholder, viewport gating, and fade-in. */
export function LazyImage({
  src,
  alt,
  fill = true,
  sizes,
  priority = false,
  className = "object-cover object-center",
  quality = IMAGE_PREVIEW_QUALITY.grid,
}: LazyImageProps) {
  const cached = hasIllustrationImageLoaded(src);
  const viewportMargin = useAdaptiveRootMargin(GALLERY.viewportRootMargin);
  const shouldObserve = !priority && !cached;
  const { ref, inViewport } = useSharedInViewport(
    viewportMargin,
    shouldObserve
  );

  const [isLoaded, setIsLoaded] = useState(cached);
  const srcRef = useRef(src);
  const shouldFetch = priority || cached || inViewport;

  useEffect(() => {
    if (srcRef.current === src) {
      return;
    }

    srcRef.current = src;
    setIsLoaded(hasIllustrationImageLoaded(src));
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

  return (
    <div ref={ref} className="absolute inset-0">
      {!isLoaded ? (
        <div
          className="gallery-card-skeleton gallery-card-skeleton-shimmer absolute inset-0"
          aria-hidden
        />
      ) : null}
      {shouldFetch ? (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes}
          quality={quality}
          className={[
            "gallery-card-image absolute inset-0 transition-opacity duration-200 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
            className,
          ].join(" ")}
          {...(priority
            ? { priority: true as const, fetchPriority: "high" as const }
            : {})}
          decoding="async"
          {...PREVIEW_IMAGE_PROPS}
          onLoad={handleImageLoad}
        />
      ) : null}
    </div>
  );
}
