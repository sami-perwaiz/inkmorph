"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { IconPackDetailView } from "@/components/Packs/IconPackDetailView";
import { IconPacksView } from "@/components/Packs/IconPacksView";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { canAccessIconPack, type IconPack } from "@/lib/iconPacks";
import type { Illustration } from "@/types/illustration";

interface IconPackDetailGateProps {
  pack: IconPack;
  illustrations: Illustration[];
}

/** Blocks premium pack detail — redirects to packs grid without purchase flow. */
export function IconPackDetailGate({
  pack,
  illustrations,
}: IconPackDetailGateProps) {
  const router = useRouter();
  const { hasPremiumAccess, isReady } = usePremiumAccess();

  const blocked = isReady && !canAccessIconPack(pack, hasPremiumAccess);

  useEffect(() => {
    if (blocked) {
      router.replace("/packs");
    }
  }, [blocked, router]);

  if (blocked) {
    return <IconPacksView />;
  }

  return <IconPackDetailView pack={pack} illustrations={illustrations} />;
}
