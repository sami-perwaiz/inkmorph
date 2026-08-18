"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

import { useDownloadLimit } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { usePremiumAccessGate } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import {
  copyImageToClipboard,
  downloadImage,
  MIN_SINGLE_DOWNLOAD_UI_MS,
} from "@/lib/illustrationActions";
import { getCanonicalFilename } from "@/lib/canonicalAsset";
import { preloadOriginalAsset } from "@/lib/originalAssetCache";
import { trackImageCopy, trackImageDownload } from "@/lib/analytics";
import { ACTION, type DownloadSize } from "@/lib/constants";
import {
  isPremiumAssetLocked,
  requiresPremiumForDownloadSize,
} from "@/lib/premiumFeatureAccess";
import type { Illustration } from "@/types/illustration";

/** Preview modal actions — idle and success only; no cancel/progress UI states. */
export type PreviewActionState = "idle" | "copied" | "downloaded" | "error";

const SUCCESS_RESET_MS = ACTION.successResetMs;
const ERROR_RESET_MS = 2200;
/** Show copy spinner only when the operation exceeds this threshold. */
const COPY_SPINNER_DELAY_MS = 400;

export function usePreviewCardAction(illustration: Illustration) {
  const { id, src, category } = illustration;
  const { hasPremiumAccess } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();
  const {
    refreshStatus,
    requestActionSlots,
    showExhaustedLimitModal,
  } = useDownloadLimit();

  const [actionState, setActionState] = useState<PreviewActionState>("idle");
  const [failedAction, setFailedAction] = useState<"copy" | "download" | null>(
    null
  );
  const [showCopySpinner, setShowCopySpinner] = useState(false);

  const inFlightRef = useRef(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copySpinnerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLocked = isPremiumAssetLocked(illustration, hasPremiumAccess);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const clearCopySpinnerTimer = useCallback(() => {
    if (copySpinnerTimerRef.current) {
      clearTimeout(copySpinnerTimerRef.current);
      copySpinnerTimerRef.current = null;
    }
    setShowCopySpinner(false);
  }, []);

  const scheduleReset = useCallback(
    (delay: number = SUCCESS_RESET_MS) => {
      clearResetTimer();
      resetTimerRef.current = setTimeout(() => {
        setActionState("idle");
        setFailedAction(null);
      }, delay);
    },
    [clearResetTimer]
  );

  const resetActionState = useCallback(() => {
    inFlightRef.current = false;
    clearCopySpinnerTimer();
    setActionState("idle");
    setFailedAction(null);
  }, [clearCopySpinnerTimer]);

  useEffect(() => {
    return () => {
      clearResetTimer();
      clearCopySpinnerTimer();
    };
  }, [clearCopySpinnerTimer, clearResetTimer]);

  useEffect(() => {
    resetActionState();
  }, [id, resetActionState]);

  const handleLockedAction = useCallback(() => {
    requestPremiumAccess();
  }, [requestPremiumAccess]);

  const ensureCreditsAvailable = useCallback(async (): Promise<boolean> => {
    if (hasPremiumAccess) {
      return true;
    }

    const latest = await refreshStatus();
    const currentRemaining = latest?.remaining ?? 0;

    if (currentRemaining <= 0) {
      showExhaustedLimitModal();
      return false;
    }

    return true;
  }, [hasPremiumAccess, refreshStatus, showExhaustedLimitModal]);

  const consumeCreditAfterSuccess = useCallback(async (): Promise<boolean> => {
    if (hasPremiumAccess) {
      return true;
    }

    const result = await requestActionSlots(1);
    return result.ok;
  }, [hasPremiumAccess, requestActionSlots]);

  const handleCopy = useCallback(async () => {
    if (isLocked) {
      handleLockedAction();
      return;
    }

    if (inFlightRef.current || actionState === "copied") {
      return;
    }

    inFlightRef.current = true;
    setFailedAction(null);

    copySpinnerTimerRef.current = setTimeout(() => {
      setShowCopySpinner(true);
    }, COPY_SPINNER_DELAY_MS);

    try {
      if (!(await ensureCreditsAvailable())) {
        resetActionState();
        return;
      }

      preloadOriginalAsset(src);
      await copyImageToClipboard(src, id);

      if (!(await consumeCreditAfterSuccess())) {
        resetActionState();
        return;
      }

      trackImageCopy(id, category);
      clearCopySpinnerTimer();
      flushSync(() => {
        setActionState("copied");
      });
      scheduleReset();
    } catch {
      clearCopySpinnerTimer();
      setFailedAction("copy");
      setActionState("error");
      scheduleReset(ERROR_RESET_MS);
    } finally {
      inFlightRef.current = false;
    }
  }, [
    actionState,
    category,
    clearCopySpinnerTimer,
    consumeCreditAfterSuccess,
    ensureCreditsAvailable,
    handleLockedAction,
    id,
    isLocked,
    resetActionState,
    scheduleReset,
    src,
  ]);

  const handleDownload = useCallback(
    async (size: DownloadSize = "1x") => {
      if (requiresPremiumForDownloadSize(size, hasPremiumAccess)) {
        requestPremiumAccess();
        return;
      }

      if (isLocked) {
        handleLockedAction();
        return;
      }

      if (inFlightRef.current || actionState === "downloaded") {
        return;
      }

      inFlightRef.current = true;
      setFailedAction(null);
      const startedAt = Date.now();

      try {
        if (!(await ensureCreditsAvailable())) {
          resetActionState();
          return;
        }

        await downloadImage(src, getCanonicalFilename(illustration), size);

        const elapsed = Date.now() - startedAt;
        if (elapsed < MIN_SINGLE_DOWNLOAD_UI_MS) {
          await new Promise((resolve) =>
            window.setTimeout(resolve, MIN_SINGLE_DOWNLOAD_UI_MS - elapsed)
          );
        }

        if (!(await consumeCreditAfterSuccess())) {
          resetActionState();
          return;
        }

        trackImageDownload(id, category);
        flushSync(() => {
          setActionState("downloaded");
        });
        scheduleReset();
      } catch {
        setFailedAction("download");
        setActionState("error");
        scheduleReset(ERROR_RESET_MS);
      } finally {
        inFlightRef.current = false;
      }
    },
    [
      actionState,
      category,
      consumeCreditAfterSuccess,
      ensureCreditsAvailable,
      handleLockedAction,
      hasPremiumAccess,
      id,
      illustration,
      isLocked,
      requestPremiumAccess,
      resetActionState,
      scheduleReset,
      src,
    ]
  );

  return {
    actionState,
    failedAction,
    isLocked,
    showCopySpinner,
    handleCopy,
    handleDownload,
    handleLockedAction,
  };
}
