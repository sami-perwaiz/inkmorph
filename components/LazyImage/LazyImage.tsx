"use client";

import Image from "next/image";

import { useLazyPreviewFetch } from "@/hooks/useLazyPreviewFetch";
import { usePreviewImageLoad } from "@/hooks/usePreviewImageLoad";
import {
  getPreviewImageProps,
  IMAGE_PREVIEW_QUALITY,
} from "@/lib/imageDelivery";

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
  const { ref, shouldFetch } = useLazyPreviewFetch(src, priority);
  const { isLoaded, hasError, handleImageLoad, handleImageError } =
    usePreviewImageLoad(src, ref, shouldFetch);

  return (
    <div ref={ref} className="absolute inset-0">
      {!isLoaded && !hasError ? (
        <div
          className="gallery-card-skeleton gallery-card-skeleton-shimmer absolute inset-0"
          aria-hidden
        />
      ) : null}

      {hasError ? (
        <div
          className="gallery-card-skeleton absolute inset-0"
          role="img"
          aria-label={`${alt} failed to load`}
        />
      ) : null}

      {shouldFetch && !hasError ? (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes}
          quality={quality}
          className={[
            "gallery-card-image absolute inset-0 transition-opacity duration-300 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
            className,
          ].join(" ")}
          {...getPreviewImageProps(priority)}
          decoding="async"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : null}
    </div>
  );
}
