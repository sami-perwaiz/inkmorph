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
import { useCardAction } from "@/hooks/useCardAction";
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

  const [isLoaded, setIsLoaded] = useState(false);
  const srcRef = useRef(src);

  useEffect(() => {
    if (srcRef.current === src) {
      return;
    }

    srcRef.current = src;
    setIsLoaded(false);
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
    if (canShowOverlay) {
      setIsHovered(true);
    }
  }, [canShowOverlay, setIsHovered]);

  const handleMouseLeave = useCallback(() => {
    if (showDesktopOverlay) {
      setIsHovered(false);
    }
  }, [setIsHovered, showDesktopOverlay]);

  if (teaser) {
    return (
      <article
        className="pointer-events-none relative aspect-square w-full overflow-hidden bg-white"
        aria-hidden
      >
        {!isLoaded && (
          <div className="gallery-card-skeleton absolute inset-0" aria-hidden />
        )}

        <Image
          key={id}
          src={src}
          alt=""
          fill
          sizes="(max-width: 833px) 33vw, (max-width: 1439px) 25vw, 20vw"
          className={[
            "gallery-card-image object-cover",
            isLoaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
          {...(priority
            ? { priority: true as const }
            : { loading: "lazy" as const })}
          decoding="async"
          draggable={false}
          onLoad={handleImageLoad}
        />
      </article>
    );
  }

  return (
    <article
      className="group relative aspect-square w-full cursor-pointer overflow-hidden bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
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

      <Image
        key={id}
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 833px) 33vw, (max-width: 1439px) 25vw, 20vw"
        className={[
          "gallery-card-image object-cover",
          isLoaded ? "opacity-100" : "opacity-0",
        ].join(" ")}
        {...(priority
          ? { priority: true as const }
          : { loading: "lazy" as const })}
        decoding="async"
        draggable={false}
        onLoad={handleImageLoad}
      />

      {illustration.premium && isLoaded && <PremiumBadge />}

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
    prev.isDesktop === next.isDesktop &&
    prev.onPreview === next.onPreview &&
    prev.priority === next.priority &&
    prev.teaser === next.teaser
  );
}

export const GalleryCard = memo(GalleryCardComponent, areGalleryCardPropsEqual);
