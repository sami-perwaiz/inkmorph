"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { LazyImage } from "@/components/LazyImage/LazyImage";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import {
  ACTION,
  PACK_WALLPAPER_THUMB_ASPECT,
  PACK_WALLPAPER_THUMB_IMAGE_SIZES,
} from "@/lib/constants";
import { IMAGE_PREVIEW_QUALITY } from "@/lib/imageDelivery";
import { buildWallpaperImageAlt } from "@/lib/seo/wallpapers";
import {
  canAccessWallpaperPack,
  type WallpaperPack,
} from "@/lib/wallpaperPacks";
import { getListingCardThumbnailUrl } from "@/lib/previewAsset";

const PurchaseProModal = dynamic(
  () =>
    import("@/components/Packs/PurchaseProModal").then((module) => ({
      default: module.PurchaseProModal,
    })),
  { ssr: false }
);

function WallpaperPremiumBadge() {
  return (
    <div
      className="pointer-events-none absolute left-5 top-5 z-10 flex items-center justify-center shadow-[0px_8px_8px_-4px_rgba(10,13,18,0.08),0px_20px_24px_-4px_rgba(10,13,18,0.14)]"
      style={{
        padding: ACTION.premiumBadgePad,
        borderRadius: ACTION.premiumBadgeRadius,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(99,99,99,0.2) 100%), linear-gradient(90deg, #000 0%, #000 100%)",
      }}
      aria-hidden
    >
      <span
        className="relative shrink-0 overflow-hidden"
        style={{
          width: ACTION.premiumCrownSize,
          height: ACTION.premiumCrownSize,
        }}
      >
        <Image
          src="/icons/crown.png"
          alt=""
          width={24}
          height={24}
          className="absolute left-[-22%] top-[-22%] size-[144%] max-w-none"
        />
      </span>
    </div>
  );
}

/** Figma 40004961:8905 — wallpaper set thumbnail tile. */
export function WallpaperCard({
  pack,
  priority = false,
}: {
  pack: WallpaperPack;
  priority?: boolean;
}) {
  const router = useRouter();
  const { hasPremiumAccess } = usePremiumAccess();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const isLocked = !canAccessWallpaperPack(pack, hasPremiumAccess);

  const handleOpen = useCallback(() => {
    if (isLocked) {
      setPurchaseModalOpen(true);
      return;
    }
    router.push(`/wallpapers/${pack.id}`);
  }, [isLocked, pack.id, router]);

  const handleClosePurchaseModal = useCallback(() => {
    setPurchaseModalOpen(false);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        aria-label={
          isLocked
            ? `${pack.title} — premium wallpaper, upgrade to open`
            : `Open ${pack.title}`
        }
        className="group relative w-full min-w-0 overflow-hidden bg-[#FAFAFA] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
        style={{ aspectRatio: PACK_WALLPAPER_THUMB_ASPECT }}
      >
        <LazyImage
          src={getListingCardThumbnailUrl(pack.thumbnailSrc)}
          alt={buildWallpaperImageAlt(pack)}
          sizes={PACK_WALLPAPER_THUMB_IMAGE_SIZES}
          priority={priority}
          quality={IMAGE_PREVIEW_QUALITY.grid}
          className={[
            "object-cover object-center",
            isLocked ? "opacity-90 group-hover:opacity-100" : "",
          ].join(" ")}
        />
        {pack.premium && !hasPremiumAccess ? <WallpaperPremiumBadge /> : null}
      </button>

      <PurchaseProModal
        open={purchaseModalOpen}
        onClose={handleClosePurchaseModal}
      />
    </>
  );
}
