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
import { ACTION } from "@/lib/constants";
import { formatDownloadProgress } from "@/lib/downloadProgress";
import { downloadPackIcons } from "@/lib/packIconDownloads";
import type { IconPack } from "@/lib/iconPacks";
import { getAccessiblePackIllustrations } from "@/lib/premiumFeatureAccess";
import { getCategoryHref } from "@/lib/seo/routes";
import type { FilterValue, Illustration } from "@/types/illustration";

interface IconPackDetailViewProps {
  pack: IconPack;
  illustrations: Illustration[];
}

const DOWNLOAD_SUCCESS_RESET_MS = ACTION.successResetMs;
const DOWNLOAD_ERROR_RESET_MS = 2600;

/** Figma 40004941:48235 — opened icon pack detail. */
export function IconPackDetailView({
  pack,
  illustrations,
}: IconPackDetailViewProps) {
  const router = useRouter();
  const { hasPremiumAccess } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();
  const {
    requestActionSlots,
    remaining,
    refreshStatus,
    showExhaustedLimitModal,
    showPartialLimitModal,
    isStatusReady,
  } = useDownloadLimit();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [downloadState, setDownloadState] = useState<PackDownloadState>("idle");
  const [downloadStatusLabel, setDownloadStatusLabel] = useState<string>();
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const downloadInFlightRef = useRef(false);
  const downloadResetTimeoutRef = useRef<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearDownloadResetTimeout = useCallback(() => {
    if (downloadResetTimeoutRef.current !== null) {
      window.clearTimeout(downloadResetTimeoutRef.current);
      downloadResetTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearDownloadResetTimeout();
      abortControllerRef.current?.abort();
    };
  }, [clearDownloadResetTimeout]);

  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  const visibleIllustrations = useMemo(
    () => getAccessiblePackIllustrations(illustrations, hasPremiumAccess),
    [hasPremiumAccess, illustrations]
  );

  const freeRemaining = useMemo(() => {
    if (hasPremiumAccess) {
      return Number.POSITIVE_INFINITY;
    }

    if (!isStatusReady) {
      return 0;
    }

    return Number.isFinite(remaining) ? Math.max(0, remaining) : 0;
  }, [hasPremiumAccess, isStatusReady, remaining]);

  useEffect(() => {
    if (hasPremiumAccess || !Number.isFinite(freeRemaining)) {
      return;
    }

    setSelectedIds((current) => {
      if (current.size <= freeRemaining) {
        return current;
      }

      return new Set([...current].slice(0, freeRemaining));
    });
  }, [freeRemaining, hasPremiumAccess]);

  const handleFilterChange = useCallback(
    (filter: FilterValue) => {
      router.push(getCategoryHref(filter));
    },
    [router]
  );

  const handleEnterSelectionMode = useCallback(async () => {
    if (hasPremiumAccess) {
      setSelectionMode(true);
      return;
    }

    const latest = await refreshStatus();
    const currentRemaining = latest?.remaining ?? 0;

    if (currentRemaining <= 0) {
      showExhaustedLimitModal();
      return;
    }

    setSelectionMode(true);
  }, [hasPremiumAccess, refreshStatus, showExhaustedLimitModal]);

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
            showExhaustedLimitModal();
            return current;
          }

          if (next.size >= freeRemaining) {
            showPartialLimitModal(freeRemaining, "cap_reached");
            return current;
          }
        }

        next.add(id);
        return next;
      });
    },
    [freeRemaining, hasPremiumAccess, showExhaustedLimitModal, showPartialLimitModal]
  );

  const runPackDownload = useCallback(
    async (items: Illustration[], wasSelecting: boolean) => {
      if (downloadInFlightRef.current || items.length === 0) {
        return;
      }

      downloadInFlightRef.current = true;
      clearDownloadResetTimeout();
      setDownloadError(null);
      setDownloadState("preparing");
      setDownloadStatusLabel("Preparing…");

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        if (!hasPremiumAccess) {
          const latest = await refreshStatus();
          const currentRemaining = latest?.remaining ?? 0;

          if (currentRemaining <= 0) {
            showExhaustedLimitModal();
            setDownloadState("idle");
            setDownloadStatusLabel(undefined);
            return;
          }

          if (items.length > currentRemaining) {
            showPartialLimitModal(currentRemaining);
            setDownloadState("idle");
            setDownloadStatusLabel(undefined);
            return;
          }
        }

        setDownloadState("downloading");

        await downloadPackIcons(pack, items, {
          signal: controller.signal,
          onProgress: (update) => {
            setDownloadStatusLabel(formatDownloadProgress(update));
          },
        });

        if (!hasPremiumAccess) {
          const consume = await requestActionSlots(items.length);
          if (!consume.ok) {
            setDownloadError("Unable to update download allowance.");
            setDownloadState("error");
            setDownloadStatusLabel("Download failed · Try again");
            downloadResetTimeoutRef.current = window.setTimeout(() => {
              downloadResetTimeoutRef.current = null;
              setDownloadState("idle");
              setDownloadStatusLabel(undefined);
            }, DOWNLOAD_ERROR_RESET_MS);
            return;
          }
        }

        if (wasSelecting) {
          setSelectionMode(false);
          setSelectedIds(new Set());
        }

        setDownloadState("success");
        setDownloadStatusLabel(
          items.length > 1
            ? `Download Complete · ${items.length} files`
            : "Downloaded"
        );
        downloadResetTimeoutRef.current = window.setTimeout(() => {
          downloadResetTimeoutRef.current = null;
          setDownloadState("idle");
          setDownloadStatusLabel(undefined);
        }, DOWNLOAD_SUCCESS_RESET_MS);
      } catch (error) {
        if (controller.signal.aborted) {
          setDownloadState("idle");
          setDownloadStatusLabel(undefined);
          setDownloadError(null);
          return;
        }

        setDownloadError("Unable to prepare download. Please try again.");
        setDownloadState("error");
        setDownloadStatusLabel("Download failed · Try again");
        downloadResetTimeoutRef.current = window.setTimeout(() => {
          downloadResetTimeoutRef.current = null;
          setDownloadState("idle");
          setDownloadStatusLabel(undefined);
          setDownloadError(null);
        }, DOWNLOAD_ERROR_RESET_MS);
      } finally {
        downloadInFlightRef.current = false;
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [
      clearDownloadResetTimeout,
      hasPremiumAccess,
      pack,
      refreshStatus,
      requestActionSlots,
      showExhaustedLimitModal,
      showPartialLimitModal,
    ]
  );

  const handleDownloadAll = useCallback(async () => {
    if (!hasPremiumAccess) {
      return;
    }

    if (selectionMode && selectedIds.size === 0) {
      return;
    }

    const items = selectionMode
      ? visibleIllustrations.filter((item) => selectedIds.has(item.id))
      : visibleIllustrations;

    await runPackDownload(items, selectionMode);
  }, [
    hasPremiumAccess,
    runPackDownload,
    selectedIds,
    selectionMode,
    visibleIllustrations,
  ]);

  const handleDownloadSelected = useCallback(async () => {
    if (selectedIds.size === 0) {
      return;
    }

    const items = visibleIllustrations.filter((item) =>
      selectedIds.has(item.id)
    );

    await runPackDownload(items, true);
  }, [runPackDownload, selectedIds, visibleIllustrations]);

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

  const handleCancelDownload = useCallback(() => {
    abortControllerRef.current?.abort();
    clearDownloadResetTimeout();
    downloadInFlightRef.current = false;
    setDownloadState("idle");
    setDownloadStatusLabel(undefined);
    setDownloadError(null);
  }, [clearDownloadResetTimeout]);

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
        downloadStatusLabel={downloadStatusLabel}
        isPremiumDownloadAll={hasPremiumAccess}
        onEnterSelectionMode={() => {
          void handleEnterSelectionMode();
        }}
        onExitSelection={handleExitSelection}
        onDownloadAll={handleToolbarDownload}
        onDownloadAllPremiumGate={handleDownloadAllPremiumGate}
        onCancelDownload={handleCancelDownload}
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
        {downloadError ??
          downloadStatusLabel ??
          (downloadState === "success"
            ? "Download started"
            : `Viewing ${pack.title} pack with ${visibleIllustrations.length} icons`)}
      </div>
    </div>
  );
}
