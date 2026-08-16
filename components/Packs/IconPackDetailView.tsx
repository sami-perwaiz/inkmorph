"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/Navbar";
import { PackIconGrid } from "@/components/Packs/PackIconGrid";
import { PackToolbar } from "@/components/Packs/PackToolbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { downloadPackIcons } from "@/lib/packIconDownloads";
import type { IconPack } from "@/lib/iconPacks";
import { getAccessiblePackIllustrations } from "@/lib/premiumFeatureAccess";
import type { FilterValue, Illustration } from "@/types/illustration";

interface IconPackDetailViewProps {
  pack: IconPack;
  illustrations: Illustration[];
}

/** Figma 40004941:48235 — opened icon pack detail. */
export function IconPackDetailView({
  pack,
  illustrations,
}: IconPackDetailViewProps) {
  const router = useRouter();
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const visibleIllustrations = useMemo(() => {
    if (!isReady) {
      return [];
    }

    return getAccessiblePackIllustrations(illustrations, hasPremiumAccess);
  }, [hasPremiumAccess, illustrations, isReady]);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(filter === "all" ? "/" : `/?filter=${filter}`);
    },
    [router]
  );

  const handleEnterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  const handleExitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleDownloadAll = useCallback(async () => {
    if (selectionMode && selectedIds.size === 0) {
      return;
    }

    const items =
      selectionMode
        ? visibleIllustrations.filter((item) => selectedIds.has(item.id))
        : visibleIllustrations;

    const wasSelecting = selectionMode;

    try {
      await downloadPackIcons(pack, items);

      if (wasSelecting) {
        setSelectionMode(false);
        setSelectedIds(new Set());
      }
    } catch {
      // Keep selection state if the download fails.
    }
  }, [visibleIllustrations, pack, selectedIds, selectionMode]);

  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar
        activeFilter={null}
        onFilterChange={handleFilterChange}
        packsActive
      />

      <PackToolbar
        selectedCount={selectedIds.size}
        selectionMode={selectionMode}
        onEnterSelectionMode={handleEnterSelectionMode}
        onExitSelection={handleExitSelection}
        onDownloadAll={handleDownloadAll}
      />

      <main className="flex w-full flex-col pt-[169px] desktop:pt-[205px]">
        <PackIconGrid
          illustrations={visibleIllustrations}
          selectionMode={selectionMode}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
        />

        <PremiumBanner />
      </main>

      <Footer onFilterChange={handleFilterChange} />

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Viewing {pack.title} pack with {visibleIllustrations.length} icons
      </div>
    </div>
  );
}
