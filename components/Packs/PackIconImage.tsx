"use client";

import Image from "next/image";
import { memo } from "react";

import { useLazyPreviewFetch } from "@/hooks/useLazyPreviewFetch";
import { usePreviewImageLoad } from "@/hooks/usePreviewImageLoad";
import { PACK_ICON } from "@/lib/constants";
import {
  getPreviewImageProps,
  IMAGE_PREVIEW_QUALITY,
  PACK_ICON_IMAGE_SIZES,
} from "@/lib/imageDelivery";

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
  const { ref, shouldFetch } = useLazyPreviewFetch(
    src,
    priority,
    PACK_ICON.viewportRootMargin
  );
  const { isLoaded, hasError, handleImageLoad, handleImageError } =
    usePreviewImageLoad(src, ref, shouldFetch);

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
          sizes={PACK_ICON_IMAGE_SIZES}
          quality={IMAGE_PREVIEW_QUALITY.tile}
          className={[
            "pack-icon-image gallery-card-image size-full object-contain object-center transition-opacity duration-300 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          {...getPreviewImageProps(priority)}
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
