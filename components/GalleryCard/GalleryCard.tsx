"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type RefObject,
  type SyntheticEvent,
} from "react";

import { ActionOverlay } from "@/components/ActionOverlay/ActionOverlay";
import { PremiumBadge } from "@/components/ActionOverlay/PremiumBadge";
import { ProtectedPremiumImage } from "@/components/ProtectedPremiumImage/ProtectedPremiumImage";
import { useCardAction } from "@/hooks/useCardAction";
import { useLazyPreviewFetch } from "@/hooks/useLazyPreviewFetch";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { shouldProtectGalleryAsset } from "@/lib/premiumFeatureAccess";
import {
  GALLERY_CARD_CLASS,
  GALLERY_CARD_IMAGE_SIZES,
  getPreviewImageProps,
  IMAGE_PREVIEW_QUALITY,
} from "@/lib/imageDelivery";
import { getPreviewAssetUrl } from "@/lib/previewAsset";
import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";
import type { Illustration } from "@/types/illustration";

interface GalleryCardProps {
  illustration: Illustration;
  isDesktop: boolean | null;
  onPreview: (illustration: Illustration) => void;
  previewModalOpen?: boolean;
  priority?: boolean;
  /** Paid peek row — visual only (no hover, badge, or interaction). */
  teaser?: boolean;
}

function useGalleryImageLoad(
  src: string,
  containerRef: RefObject<HTMLDivElement | null>,
  enabled = true,
  priority = false
) {
  const [isLoaded, setIsLoaded] = useState(() => hasIllustrationImageLoaded(src));
  const srcRef = useRef(src);

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

      if (priority) {
        revealImage();
        return;
      }

      if (typeof img.decode === "function") {
        img.decode().then(revealImage).catch(revealImage);
        return;
      }

      revealImage();
    },
    [priority, revealImage, src]
  );

  /** Cached / unoptimized images may finish before `onLoad` attaches. */
  useLayoutEffect(() => {
    if (!enabled || isLoaded) {
      return;
    }

    const img = containerRef.current?.querySelector("img");
    if (img?.complete && img.naturalWidth > 0) {
      revealImage();
    }
  }, [containerRef, enabled, isLoaded, revealImage, src]);

  return { isLoaded, handleImageLoad };
}

const GALLERY_CARD_SKELETON_CLASS =
  "gallery-card-skeleton gallery-card-skeleton-shimmer absolute inset-0";

/** Paywalled peek tile — no action hooks or overlays. */
function GalleryTeaserCard({
  illustration,
  priority = false,
}: {
  illustration: Illustration;
  priority?: boolean;
}) {
  const { id } = illustration;
  const previewSrc = getPreviewAssetUrl(illustration, "grid");
  const { ref, shouldFetch } = useLazyPreviewFetch(previewSrc, priority);
  const { isLoaded, handleImageLoad } = useGalleryImageLoad(
    previewSrc,
    ref,
    shouldFetch,
    priority
  );
  const showSkeleton = !isLoaded && !priority;

  return (
    <article
      className={[
        GALLERY_CARD_CLASS,
        "pointer-events-none overflow-hidden bg-white",
      ].join(" ")}
      aria-hidden
    >
      {showSkeleton ? (
        <div className={GALLERY_CARD_SKELETON_CLASS} aria-hidden />
      ) : null}

      <div ref={ref} className="absolute inset-0">
        {shouldFetch ? (
          <Image
            key={id}
            src={previewSrc}
            alt=""
            fill
            sizes={GALLERY_CARD_IMAGE_SIZES}
            quality={IMAGE_PREVIEW_QUALITY.grid}
            className={[
              "gallery-card-image object-contain object-center",
              isLoaded || priority ? "opacity-100" : "opacity-0",
            ].join(" ")}
            {...getPreviewImageProps(priority)}
            decoding="async"
            draggable={false}
            onLoad={handleImageLoad}
          />
        ) : null}
      </div>
    </article>
  );
}

function GalleryInteractiveCard({
  illustration,
  isDesktop,
  onPreview,
  previewModalOpen = false,
  priority = false,
}: Omit<GalleryCardProps, "teaser">) {
  const { id, src, alt } = illustration;
  const previewSrc = getPreviewAssetUrl(illustration, "grid");
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
    cancelAction,
  } = useCardAction(illustration);
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const hasFullLibraryAccess = isReady && hasPremiumAccess;
  const protectImage = shouldProtectGalleryAsset(
    illustration,
    hasFullLibraryAccess
  );
  const { ref, shouldFetch } = useLazyPreviewFetch(previewSrc, priority);
  const { isLoaded, handleImageLoad } = useGalleryImageLoad(
    previewSrc,
    ref,
    shouldFetch,
    priority
  );
  const showPremiumBadge =
    Boolean(illustration.premium) && isLoaded && !hasFullLibraryAccess;
  const showSkeleton = !isLoaded && !priority;

  useEffect(() => {
    setIsHovered(false);
  }, [src, setIsHovered]);

  const showDesktopOverlay = isDesktop === true && !previewModalOpen;
  const canShowOverlay = showDesktopOverlay && isLoaded;
  const overlayVisible = canShowOverlay && showOverlay;

  const handleOpenPreview = useCallback(() => {
    setIsHovered(false);
    onPreview(illustration);
  }, [illustration, onPreview, setIsHovered]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onPreview(illustration);
      }
    },
    [illustration, onPreview]
  );

  const handleMouseEnter = useCallback(() => {
    if (canShowOverlay) {
      setIsHovered(true);
    }
  }, [canShowOverlay, setIsHovered]);

  const handleMouseLeave = useCallback(() => {
    if (showDesktopOverlay) {
      setIsHovered(false);
    }
  }, [setIsHovered, showDesktopOverlay]);

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
      {showSkeleton ? (
        <div className={GALLERY_CARD_SKELETON_CLASS} aria-hidden />
      ) : null}

      <div ref={ref} className="absolute inset-0">
        <ProtectedPremiumImage enabled={protectImage} className="absolute inset-0">
          {shouldFetch ? (
            <Image
              key={id}
              src={previewSrc}
              alt={alt}
              fill
              sizes={GALLERY_CARD_IMAGE_SIZES}
              quality={IMAGE_PREVIEW_QUALITY.grid}
              className={[
                "gallery-card-image object-contain object-center",
                isLoaded || priority ? "opacity-100" : "opacity-0",
              ].join(" ")}
              {...getPreviewImageProps(priority)}
              decoding="async"
              draggable={false}
              onLoad={handleImageLoad}
            />
          ) : null}
        </ProtectedPremiumImage>
      </div>

      {showPremiumBadge ? <PremiumBadge /> : null}

      {canShowOverlay ? (
        <ActionOverlay
          actionState={actionState}
          failedAction={failedAction}
          visible={overlayVisible}
          statusMessage={statusMessage}
          locked={isLocked}
          onCopy={handleCopy}
          onDownload={handleDownload}
          onLockedAction={handleLockedAction}
          onCancel={cancelAction}
        />
      ) : null}
    </article>
  );
}

function GalleryCardComponent({
  illustration,
  isDesktop,
  onPreview,
  previewModalOpen = false,
  priority = false,
  teaser = false,
}: GalleryCardProps) {
  if (teaser) {
    return <GalleryTeaserCard illustration={illustration} priority={priority} />;
  }

  return (
    <GalleryInteractiveCard
      illustration={illustration}
      isDesktop={isDesktop}
      onPreview={onPreview}
      previewModalOpen={previewModalOpen}
      priority={priority}
    />
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
    prev.previewModalOpen === next.previewModalOpen &&
    prev.priority === next.priority &&
    prev.teaser === next.teaser
  );
}

export const GalleryCard = memo(GalleryCardComponent, areGalleryCardPropsEqual);
