"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Footer } from "@/components/Footer/Footer";
import { Navbar } from "@/components/Navbar/Navbar";
import { PackIconGrid } from "@/components/Packs/PackIconGrid";
import {
  PackToolbar,
  type PackDownloadState,
} from "@/components/Packs/PackToolbar";
import { PremiumBanner } from "@/components/PremiumBanner/PremiumBanner";
import { useDownloadLimit } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { usePremiumAccessGate } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
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
  const { hasPremiumAccess } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();
  const { requestActionSlots, remaining, showLimitModal } = useDownloadLimit();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [downloadState, setDownloadState] = useState<PackDownloadState>("idle");
  const downloadResetTimeoutRef = useRef<number | null>(null);

  const clearDownloadResetTimeout = useCallback(() => {
    if (downloadResetTimeoutRef.current !== null) {
      window.clearTimeout(downloadResetTimeoutRef.current);
      downloadResetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearDownloadResetTimeout();
    };
  }, [clearDownloadResetTimeout]);

  const visibleIllustrations = useMemo(
    () => getAccessiblePackIllustrations(illustrations, hasPremiumAccess),
    [hasPremiumAccess, illustrations]
  );

  const freeRemaining = useMemo(() => {
    if (hasPremiumAccess) {
      return Number.POSITIVE_INFINITY;
    }

    return Number.isFinite(remaining) ? remaining : 0;
  }, [hasPremiumAccess, remaining]);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(filter === "all" ? "/" : `/?filter=${filter}`);
    },
    [router]
  );

  const handleEnterSelectionMode = useCallback(() => {
    if (!hasPremiumAccess && freeRemaining <= 0) {
      showLimitModal();
      return;
    }

    setSelectionMode(true);
  }, [freeRemaining, hasPremiumAccess, showLimitModal]);

  const handleExitSelection = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }, []);

  const handleToggleSelect = useCallback(
    (id: string) => {
      setSelectedIds((current) => {
        const next = new Set(current);

        if (next.has(id)) {
          next.delete(id);
          return next;
        }

        if (!hasPremiumAccess) {
          if (freeRemaining <= 0) {
            showLimitModal();
            return current;
          }

          if (next.size >= freeRemaining) {
            showLimitModal();
            return current;
          }
        }

        next.add(id);
        return next;
      });
    },
    [freeRemaining, hasPremiumAccess, showLimitModal]
  );

  const handleDownloadAll = useCallback(async () => {
    if (downloadState === "preparing") {
      return;
    }

    if (!hasPremiumAccess) {
      return;
    }

    if (selectionMode && selectedIds.size === 0) {
      return;
    }

    const items = selectionMode
      ? visibleIllustrations.filter((item) => selectedIds.has(item.id))
      : visibleIllustrations;

    const wasSelecting = selectionMode;

    clearDownloadResetTimeout();
    setDownloadState("preparing");

    try {
      await downloadPackIcons(pack, items);

      if (wasSelecting) {
        setSelectionMode(false);
        setSelectedIds(new Set());
      }

      setDownloadState("success");
      downloadResetTimeoutRef.current = window.setTimeout(() => {
        downloadResetTimeoutRef.current = null;
        setDownloadState("idle");
      }, 2000);
    } catch {
      setDownloadState("idle");
    }
  }, [
    clearDownloadResetTimeout,
    downloadState,
    hasPremiumAccess,
    visibleIllustrations,
    pack,
    selectedIds,
    selectionMode,
  ]);

  const handleDownloadSelected = useCallback(async () => {
    if (downloadState === "preparing") {
      return;
    }

    if (selectedIds.size === 0) {
      return;
    }

    const items = visibleIllustrations.filter((item) =>
      selectedIds.has(item.id)
    );

    clearDownloadResetTimeout();
    setDownloadState("preparing");

    try {
      if (!hasPremiumAccess) {
        if (items.length > freeRemaining) {
          showLimitModal();
          setDownloadState("idle");
          return;
        }

        const { ok } = await requestActionSlots(items.length);
        if (!ok) {
          setDownloadState("idle");
          return;
        }
      }

      await downloadPackIcons(pack, items);

      setSelectionMode(false);
      setSelectedIds(new Set());

      setDownloadState("success");
      downloadResetTimeoutRef.current = window.setTimeout(() => {
        downloadResetTimeoutRef.current = null;
        setDownloadState("idle");
      }, 2000);
    } catch {
      setDownloadState("idle");
    }
  }, [
    clearDownloadResetTimeout,
    downloadState,
    freeRemaining,
    hasPremiumAccess,
    pack,
    requestActionSlots,
    selectedIds,
    showLimitModal,
    visibleIllustrations,
  ]);

  const handleDownloadAllPremiumGate = useCallback(() => {
    requestPremiumAccess();
  }, [requestPremiumAccess]);

  const handleToolbarDownload = useCallback(() => {
    if (selectionMode) {
      void handleDownloadSelected();
      return;
    }

    void handleDownloadAll();
  }, [handleDownloadAll, handleDownloadSelected, selectionMode]);

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
        downloadState={downloadState}
        isPremiumDownloadAll={hasPremiumAccess}
        onEnterSelectionMode={handleEnterSelectionMode}
        onExitSelection={handleExitSelection}
        onDownloadAll={handleToolbarDownload}
        onDownloadAllPremiumGate={handleDownloadAllPremiumGate}
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
        {downloadState === "preparing"
          ? "Preparing download"
          : downloadState === "success"
            ? "Download started"
            : `Viewing ${pack.title} pack with ${visibleIllustrations.length} icons`}
      </div>
    </div>
  );
}
