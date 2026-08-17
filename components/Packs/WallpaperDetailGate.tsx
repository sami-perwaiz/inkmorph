"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

/** Blocks premium wallpaper detail — redirects to wallpapers grid without purchase flow. */
export function WallpaperDetailGate({ pack }: WallpaperDetailGateProps) {
  const router = useRouter();
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!canAccessWallpaperPack(pack, hasPremiumAccess)) {
      setAllowed(false);
      router.replace("/wallpapers");
      return;
    }

    setAllowed(true);
  }, [pack, hasPremiumAccess, isReady, router]);

  if (!isReady) {
    return null;
  }

  if (!allowed) {
    return <WallpapersView />;
  }

  return <WallpaperDetailView pack={pack} />;
}
