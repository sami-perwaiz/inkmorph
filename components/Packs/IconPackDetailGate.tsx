"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { IconPackDetailView } from "@/components/Packs/IconPackDetailView";
import { IconPacksView } from "@/components/Packs/IconPacksView";
import { PurchaseProModal } from "@/components/Packs/PurchaseProModal";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { canAccessIconPack, type IconPack } from "@/lib/iconPacks";
import type { Illustration } from "@/types/illustration";

interface IconPackDetailGateProps {
  pack: IconPack;
  illustrations: Illustration[];
}

/** Blocks premium pack detail — shows purchase modal over packs grid. */
export function IconPackDetailGate({
  pack,
  illustrations,
}: IconPackDetailGateProps) {
  const router = useRouter();
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  const blocked = isReady && !canAccessIconPack(pack, hasPremiumAccess);

  useEffect(() => {
    setPurchaseModalOpen(blocked);
  }, [blocked]);

  const handleClosePurchaseModal = useCallback(() => {
    setPurchaseModalOpen(false);
    router.replace("/packs");
  }, [router]);

  if (blocked) {
    return (
      <>
        <IconPacksView />
        <PurchaseProModal
          open={purchaseModalOpen}
          onClose={handleClosePurchaseModal}
        />
      </>
    );
  }

  return <IconPackDetailView pack={pack} illustrations={illustrations} />;
}
