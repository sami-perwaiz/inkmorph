"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { LazyImage } from "@/components/LazyImage/LazyImage";
import { PurchaseProModal } from "@/components/Packs/PurchaseProModal";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import {
  ACTION,
  PACK_WALLPAPER_THUMB_ASPECT,
  PACK_WALLPAPER_THUMB_IMAGE_SIZES,
} from "@/lib/constants";
import { canAccessIconPack, type IconPack } from "@/lib/iconPacks";

function PackPremiumBadge() {
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

/** Figma 40004936:47780 — pack thumbnail + title + description. */
export function PackCard({
  pack,
  priority = false,
}: {
  pack: IconPack;
  priority?: boolean;
}) {
  const router = useRouter();
  const { hasPremiumAccess } = usePremiumAccess();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const isLocked = !canAccessIconPack(pack, hasPremiumAccess);

  const handleOpen = useCallback(() => {
    if (isLocked) {
      setPurchaseModalOpen(true);
      return;
    }
    router.push(`/packs/${pack.id}`);
  }, [isLocked, pack.id, router]);

  const handleClosePurchaseModal = useCallback(() => {
    setPurchaseModalOpen(false);
  }, []);

  return (
    <>
      <article className="flex min-w-0 flex-col gap-5">
        <button
        type="button"
        onClick={handleOpen}
        aria-label={
          isLocked
            ? `${pack.title} — premium pack, upgrade to open`
            : `Open ${pack.title}`
        }
        className={[
          "group relative w-full min-w-0 overflow-hidden bg-[#FAFAFA] text-left",
          isLocked ? "cursor-pointer" : "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
        ].join(" ")}
        style={{ aspectRatio: PACK_WALLPAPER_THUMB_ASPECT }}
      >
        <LazyImage
          src={pack.thumbnailSrc}
          alt=""
          sizes={PACK_WALLPAPER_THUMB_IMAGE_SIZES}
          priority={priority}
          className={[
            "object-cover object-center",
            isLocked ? "opacity-90 group-hover:opacity-100" : "",
          ].join(" ")}
        />
        {pack.premium ? <PackPremiumBadge /> : null}
        </button>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-poppins text-xl font-medium leading-normal tracking-[-0.2px] text-black">
              {pack.title}
            </h2>
            {pack.availabilityLabel && !hasPremiumAccess ? (
              <p className="font-poppins text-base font-normal leading-normal tracking-[-0.16px] text-[#12B76A]">
                {pack.availabilityLabel}
              </p>
            ) : null}
          </div>
          <p className="font-poppins text-base font-normal leading-normal tracking-[-0.16px] text-[#494949]">
            {pack.description}
          </p>
        </div>
      </article>

      <PurchaseProModal
        open={purchaseModalOpen}
        onClose={handleClosePurchaseModal}
      />
    </>
  );
}
