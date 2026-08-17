"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type SyntheticEvent,
} from "react";

import { ActionOverlay } from "@/components/ActionOverlay/ActionOverlay";
import { PremiumBadge } from "@/components/ActionOverlay/PremiumBadge";
import { ProtectedPremiumImage } from "@/components/ProtectedPremiumImage/ProtectedPremiumImage";
import { useCardAction } from "@/hooks/useCardAction";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useSharedInViewport } from "@/hooks/useSharedInViewport";
import { GALLERY } from "@/lib/constants";
import {
  shouldProtectGalleryAsset,
} from "@/lib/premiumFeatureAccess";
import { preloadOriginalAsset } from "@/lib/originalAssetCache";
import {
  GALLERY_CARD_CLASS,
  GALLERY_CARD_IMAGE_SIZES,
  PREVIEW_IMAGE_PROPS,
  IMAGE_PREVIEW_QUALITY,
} from "@/lib/imageDelivery";
import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";
import type { Illustration } from "@/types/illustration";

interface GalleryCardProps {
  illustration: Illustration;
  isDesktop: boolean | null;
  onPreview: (illustration: Illustration) => void;
  priority?: boolean;
  /** Paid peek row — visual only (no hover, badge, or interaction). */
  teaser?: boolean;
}

function GalleryCardComponent({
  illustration,
  isDesktop,
  onPreview,
  priority = false,
  teaser = false,
}: GalleryCardProps) {
  const { id, src, alt } = illustration;
  const {
    actionState,
    failedAction,
    isLocked,
    showOverlay,
    statusMessage,
    setIsHovered,
    handleCopy,
    handleDownload,
    handleLockedAction,
  } = useCardAction(illustration);
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const hasFullLibraryAccess = isReady && hasPremiumAccess;
  const protectImage = shouldProtectGalleryAsset(
    illustration,
    hasFullLibraryAccess
  );

  const [isLoaded, setIsLoaded] = useState(() => hasIllustrationImageLoaded(src));
  const srcRef = useRef(src);
  const showPremiumBadge =
    Boolean(illustration.premium) && isLoaded && !hasFullLibraryAccess;

  const cached = hasIllustrationImageLoaded(src);
  const shouldObserve = !priority && !cached;
  const { ref: viewportRef, inViewport } = useSharedInViewport(
    GALLERY.viewportRootMargin,
    shouldObserve
  );
  const shouldFetch = priority || cached || inViewport;

  useEffect(() => {
    if (srcRef.current === src) {
      return;
    }

    srcRef.current = src;
    setIsLoaded(hasIllustrationImageLoaded(src));
    setIsHovered(false);
  }, [src, setIsHovered]);

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

      // Cached this session: skip decode wait, reveal as soon as the element is ready.
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

  const showDesktopOverlay = !teaser && isDesktop === true;
  const canShowOverlay = showDesktopOverlay && isLoaded;
  const overlayVisible = canShowOverlay && showOverlay;

  const handleOpenPreview = useCallback(() => {
    if (teaser) {
      return;
    }
    onPreview(illustration);
  }, [illustration, onPreview, teaser]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (teaser) {
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onPreview(illustration);
      }
    },
    [illustration, onPreview, teaser]
  );

  const handleMouseEnter = useCallback(() => {
    if (!isLocked) {
      preloadOriginalAsset(src);
    }
    if (canShowOverlay) {
      setIsHovered(true);
    }
  }, [canShowOverlay, isLocked, setIsHovered, src]);

  const handleMouseLeave = useCallback(() => {
    if (showDesktopOverlay) {
      setIsHovered(false);
    }
  }, [setIsHovered, showDesktopOverlay]);

  if (teaser) {
    return (
      <article
        className={[
          GALLERY_CARD_CLASS,
          "pointer-events-none overflow-hidden bg-white",
        ].join(" ")}
        aria-hidden
      >
        {!isLoaded && (
          <div className="gallery-card-skeleton absolute inset-0" aria-hidden />
        )}

        <div ref={viewportRef} className="absolute inset-0">
          {shouldFetch ? (
            <Image
              key={id}
              src={src}
              alt=""
              fill
              sizes={GALLERY_CARD_IMAGE_SIZES}
              quality={IMAGE_PREVIEW_QUALITY.grid}
              className={[
                "gallery-card-image object-contain object-center",
                isLoaded ? "opacity-100" : "opacity-0",
              ].join(" ")}
              {...(priority
                ? { priority: true as const, fetchPriority: "high" as const }
                : {})}
              decoding="async"
              draggable={false}
              {...PREVIEW_IMAGE_PROPS}
              onLoad={handleImageLoad}
            />
          ) : null}
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        GALLERY_CARD_CLASS,
        "group cursor-pointer overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
      ].join(" ")}
      role="button"
      tabIndex={0}
      aria-label={`Open preview for ${alt}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOpenPreview}
      onKeyDown={handleKeyDown}
    >
      {!isLoaded && (
        <div
          className="gallery-card-skeleton absolute inset-0"
          aria-hidden
        />
      )}

      <div ref={viewportRef} className="absolute inset-0">
        <ProtectedPremiumImage enabled={protectImage} className="absolute inset-0">
          {shouldFetch ? (
            <Image
              key={id}
              src={src}
              alt={alt}
              fill
              sizes={GALLERY_CARD_IMAGE_SIZES}
              quality={IMAGE_PREVIEW_QUALITY.grid}
              className={[
                "gallery-card-image object-contain object-center",
                isLoaded ? "opacity-100" : "opacity-0",
              ].join(" ")}
              {...(priority
                ? { priority: true as const, fetchPriority: "high" as const }
                : {})}
              decoding="async"
              draggable={false}
              {...PREVIEW_IMAGE_PROPS}
              onLoad={handleImageLoad}
            />
          ) : null}
        </ProtectedPremiumImage>
      </div>

      {showPremiumBadge ? <PremiumBadge /> : null}

      {canShowOverlay && (
        <ActionOverlay
          actionState={actionState}
          failedAction={failedAction}
          visible={overlayVisible}
          statusMessage={statusMessage}
          locked={isLocked}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onLockedAction={handleLockedAction}
        />
      )}
    </article>
  );
}

function areGalleryCardPropsEqual(
  prev: GalleryCardProps,
  next: GalleryCardProps
): boolean {
  return (
    prev.illustration.id === next.illustration.id &&
    prev.illustration.src === next.illustration.src &&
    prev.illustration.premium === next.illustration.premium &&
    prev.illustration.paywalled === next.illustration.paywalled &&
    prev.isDesktop === next.isDesktop &&
    prev.onPreview === next.onPreview &&
    prev.priority === next.priority &&
    prev.teaser === next.teaser
  );
}

export const GalleryCard = memo(GalleryCardComponent, areGalleryCardPropsEqual);
