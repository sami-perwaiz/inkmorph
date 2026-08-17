"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDownloadLimit } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { usePremiumAccessGate } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import {
  copyImageToClipboard,
  downloadImage,
} from "@/lib/illustrationActions";
import { getCanonicalFilename } from "@/lib/canonicalAsset";
import { formatDownloadProgress } from "@/lib/downloadProgress";
import { preloadOriginalAsset } from "@/lib/originalAssetCache";
import { trackImageCopy, trackImageDownload } from "@/lib/analytics";
import { ACTION, type DownloadSize } from "@/lib/constants";
import {
  isPremiumAssetLocked,
  requiresPremiumForDownloadSize,
} from "@/lib/premiumFeatureAccess";
import type { CardActionState } from "@/types/action";
import type { Illustration } from "@/types/illustration";

const SUCCESS_RESET_MS = ACTION.successResetMs;
const ERROR_RESET_MS = 2200;

export function useCardAction(illustration: Illustration) {
  const { id, src, category } = illustration;
  const { hasPremiumAccess } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();
  const {
    refreshStatus,
    requestActionSlots,
    showExhaustedLimitModal,
  } = useDownloadLimit();
  const [actionState, setActionState] = useState<CardActionState>("idle");
  const [failedAction, setFailedAction] = useState<"copy" | "download" | null>(
    null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionStateRef = useRef(actionState);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isLocked = isPremiumAssetLocked(illustration, hasPremiumAccess);

  useEffect(() => {
    actionStateRef.current = actionState;
  }, [actionState]);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(
    (delay: number = SUCCESS_RESET_MS) => {
      clearResetTimer();
      resetTimerRef.current = setTimeout(() => {
        setActionState("idle");
        setFailedAction(null);
        setStatusMessage("");
      }, delay);
    },
    [clearResetTimer]
  );

  const resetActionState = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setActionState("idle");
    setFailedAction(null);
    setStatusMessage("");
  }, []);

  useEffect(() => {
    return () => {
      clearResetTimer();
      abortControllerRef.current?.abort();
    };
  }, [clearResetTimer]);

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

    if (
      actionStateRef.current !== "idle" &&
      actionStateRef.current !== "error"
    ) {
      return;
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setFailedAction(null);
    setActionState("copying");
    setStatusMessage("Preparing…");

    try {
      if (!(await ensureCreditsAvailable())) {
        resetActionState();
        return;
      }

      preloadOriginalAsset(src);

      await copyImageToClipboard(src, id, {
        signal: controller.signal,
        onProgress: (update) => {
          setStatusMessage(formatDownloadProgress(update));
        },
      });

      if (!(await consumeCreditAfterSuccess())) {
        resetActionState();
        return;
      }

      trackImageCopy(id, category);
      setActionState("copied");
      setStatusMessage("Copied");
      scheduleReset();
    } catch (error) {
      if (controller.signal.aborted) {
        resetActionState();
        return;
      }

      setFailedAction("copy");
      setActionState("error");
      setStatusMessage(
        error instanceof Error && error.message.includes("Clipboard")
          ? "Copy failed · Try again"
          : "Copy failed · Try again"
      );
      scheduleReset(ERROR_RESET_MS);
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [
    category,
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

      if (
        actionStateRef.current !== "idle" &&
        actionStateRef.current !== "error"
      ) {
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setFailedAction(null);
      setActionState("downloading");
      setStatusMessage("Downloading…");

      try {
        if (!(await ensureCreditsAvailable())) {
          resetActionState();
          return;
        }

        await downloadImage(src, getCanonicalFilename(illustration), size, {
          signal: controller.signal,
        });

        if (!(await consumeCreditAfterSuccess())) {
          resetActionState();
          return;
        }

        trackImageDownload(id, category);
        setActionState("downloaded");
        setStatusMessage("Downloaded");
        scheduleReset();
      } catch (error) {
        if (controller.signal.aborted) {
          resetActionState();
          return;
        }

        setFailedAction("download");
        setActionState("error");
        setStatusMessage("Download failed · Try again");
        scheduleReset(ERROR_RESET_MS);
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    },
    [
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

  const cancelAction = useCallback(() => {
    abortControllerRef.current?.abort();
    resetActionState();
    setStatusMessage("Cancelled");
    scheduleReset(900);
  }, [resetActionState, scheduleReset]);

  const showOverlay =
    isHovered ||
    actionState === "copying" ||
    actionState === "downloading" ||
    actionState === "copied" ||
    actionState === "downloaded" ||
    actionState === "error";

  return {
    actionState,
    failedAction,
    isHovered,
    isLocked,
    showOverlay,
    statusMessage,
    setIsHovered,
    handleCopy,
    handleDownload,
    handleLockedAction,
    cancelAction,
  };
}
