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
  const [allowed, setAllowed] = useState(false);
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!canAccessIconPack(pack, hasPremiumAccess)) {
      setPurchaseModalOpen(true);
      setAllowed(false);
      return;
    }

    setPurchaseModalOpen(false);
    setAllowed(true);
  }, [pack, hasPremiumAccess, isReady]);

  const handleClosePurchaseModal = useCallback(() => {
    setPurchaseModalOpen(false);
    router.replace("/packs");
  }, [router]);

  if (!isReady) {
    return null;
  }

  if (!allowed) {
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
