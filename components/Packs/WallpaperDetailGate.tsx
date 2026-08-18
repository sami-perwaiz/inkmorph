"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { PurchaseProModal } from "@/components/Packs/PurchaseProModal";
import { WallpaperDetailView } from "@/components/Packs/WallpaperDetailView";
import { WallpapersView } from "@/components/Packs/WallpapersView";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import {
  canAccessWallpaperPack,
  type WallpaperPack,
} from "@/lib/wallpaperPacks";

interface WallpaperDetailGateProps {
  pack: WallpaperPack;
}

/** Blocks premium wallpaper detail — shows purchase modal over wallpapers grid. */
export function WallpaperDetailGate({ pack }: WallpaperDetailGateProps) {
  const router = useRouter();
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const [allowed, setAllowed] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!canAccessWallpaperPack(pack, hasPremiumAccess)) {
      setPurchaseModalOpen(true);
      setAllowed(false);
      return;
    }

    setPurchaseModalOpen(false);
    setAllowed(true);
  }, [pack, hasPremiumAccess, isReady]);

  const handleClosePurchaseModal = useCallback(() => {
    setPurchaseModalOpen(false);
    router.replace("/wallpapers");
  }, [router]);

  if (!isReady) {
    return null;
  }

  if (!allowed) {
    return (
      <>
        <WallpapersView />
        <PurchaseProModal
          open={purchaseModalOpen}
          onClose={handleClosePurchaseModal}
        />
      </>
    );
  }

  return <WallpaperDetailView pack={pack} />;
}
