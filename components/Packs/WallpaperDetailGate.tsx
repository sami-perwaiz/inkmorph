"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

  const blocked = isReady && !canAccessWallpaperPack(pack, hasPremiumAccess);

  useEffect(() => {
    if (blocked) {
      router.replace("/wallpapers");
    }
  }, [blocked, router]);

  if (blocked) {
    return <WallpapersView />;
  }

  return <WallpaperDetailView pack={pack} />;
}
