"use client";

import Image from "next/image";
import { memo, useCallback } from "react";

import { ActionOverlay } from "@/components/ActionOverlay/ActionOverlay";
import { useCardAction } from "@/hooks/useCardAction";
import type { Illustration } from "@/types/illustration";

interface GalleryCardProps {
  illustration: Illustration;
  isDesktop: boolean | null;
  onPreview: (illustration: Illustration) => void;
}

function GalleryCardComponent({
  illustration,
  isDesktop,
  onPreview,
}: GalleryCardProps) {
  const {
    actionState,
    showOverlay,
    setIsHovered,
    handleCopy,
    handleDownload,
  } = useCardAction(illustration);

  const overlayVisible = isDesktop === true && showOverlay;
  const showDesktopOverlay = isDesktop === true;

  const handleOpenPreview = useCallback(() => {
    if (isDesktop === true) {
      return;
    }

    onPreview(illustration);
  }, [illustration, isDesktop, onPreview]);

  return (
    <article
      className={[
        "group relative aspect-square w-full overflow-hidden rounded-2xl",
        showDesktopOverlay ? "" : "cursor-pointer",
      ].join(" ")}
      onMouseEnter={() => {
        if (showDesktopOverlay) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (showDesktopOverlay) {
          setIsHovered(false);
        }
      }}
      onClick={handleOpenPreview}
    >
      <Image
        src={illustration.src}
        alt={illustration.alt}
        fill
        sizes="(max-width: 833px) 106px, (max-width: 1439px) 168px, 252px"
        className="object-cover"
        loading="lazy"
      />

      {showDesktopOverlay && (
        <ActionOverlay
          actionState={actionState}
          visible={overlayVisible}
          onCopy={handleCopy}
          onDownload={handleDownload}
        />
      )}
    </article>
  );
}

export const GalleryCard = memo(GalleryCardComponent);
