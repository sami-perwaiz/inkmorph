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
}

function GalleryCardComponent({
  illustration,
  isDesktop,
  onPreview,
  priority = false,
}: GalleryCardProps) {
  const { id, src, alt } = illustration;
  const {
    actionState,
    failedAction,
    showOverlay,
    statusMessage,
    setIsHovered,
    handleCopy,
    handleDownload,
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

  const showDesktopOverlay = isDesktop === true;
  const canShowOverlay = showDesktopOverlay && isLoaded;
  const overlayVisible = canShowOverlay && showOverlay;
  const isPreviewInteractive = isDesktop !== true;

  const handleOpenPreview = useCallback(() => {
    if (!isPreviewInteractive) {
      return;
    }

    onPreview(illustration);
  }, [illustration, isPreviewInteractive, onPreview]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (!isPreviewInteractive) {
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onPreview(illustration);
      }
    },
    [illustration, isPreviewInteractive, onPreview]
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
        "group relative aspect-square w-full overflow-hidden rounded-2xl",
        isPreviewInteractive
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
          : "",
      ].join(" ")}
      role={isPreviewInteractive ? "button" : undefined}
      tabIndex={isPreviewInteractive ? 0 : undefined}
      aria-label={
        isPreviewInteractive ? `Open preview for ${alt}` : undefined
      }
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleOpenPreview}
      onKeyDown={handleKeyDown}
    >
      {!isLoaded && (
        <div
          className="gallery-card-skeleton absolute inset-0 rounded-2xl"
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

      {canShowOverlay && (
        <ActionOverlay
          actionState={actionState}
          failedAction={failedAction}
          visible={overlayVisible}
          statusMessage={statusMessage}
          onCopy={handleCopy}
          onDownload={handleDownload}
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
    prev.isDesktop === next.isDesktop &&
    prev.onPreview === next.onPreview &&
    prev.priority === next.priority
  );
}

export const GalleryCard = memo(GalleryCardComponent, areGalleryCardPropsEqual);
