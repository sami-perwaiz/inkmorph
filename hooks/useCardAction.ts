"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useDownloadLimit } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { usePremiumAccessGate } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import {
  copyImageToClipboard,
  downloadImage,
} from "@/lib/illustrationActions";
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
const ERROR_RESET_MS = 1800;

export function useCardAction(illustration: Illustration) {
  const { id, src, category } = illustration;
  const { hasPremiumAccess } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();
  const { requestDownloadSlot, commitDownloadSlot } = useDownloadLimit();
  const [actionState, setActionState] = useState<CardActionState>("idle");
  const [failedAction, setFailedAction] = useState<"copy" | "download" | null>(
    null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionStateRef = useRef(actionState);
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

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const handleLockedAction = useCallback(() => {
    requestPremiumAccess();
  }, [requestPremiumAccess]);

  const handleCopy = useCallback(async () => {
    if (isLocked) {
      handleLockedAction();
      return;
    }

    if (actionStateRef.current !== "idle" && actionStateRef.current !== "error") {
      return;
    }

    setFailedAction(null);
    setActionState("copying");
    setStatusMessage("Copying image");
    preloadOriginalAsset(src);

    try {
      await copyImageToClipboard(src, id);
      trackImageCopy(id, category);
      setActionState("copied");
      setStatusMessage("Image copied to clipboard");
      scheduleReset();
    } catch {
      setFailedAction("copy");
      setActionState("error");
      setStatusMessage("Unable to copy image");
      scheduleReset(ERROR_RESET_MS);
    }
  }, [category, handleLockedAction, id, isLocked, scheduleReset, src]);

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

      if (actionStateRef.current !== "idle" && actionStateRef.current !== "error") {
        return;
      }

      if (!requestDownloadSlot()) {
        return;
      }

      setFailedAction(null);
      setActionState("downloading");
      setStatusMessage(
        size === "2x" ? "Downloading high-quality PNG" : "Downloading PNG"
      );
      preloadOriginalAsset(src);

      try {
        await downloadImage(src, `${id}.png`, size);
        commitDownloadSlot();
        trackImageDownload(id, category);
        setActionState("downloaded");
        setStatusMessage(
          size === "2x" ? "Downloaded high-quality PNG" : "Downloaded PNG"
        );
        scheduleReset();
      } catch {
        setFailedAction("download");
        setActionState("error");
        setStatusMessage("Unable to download image");
        scheduleReset(ERROR_RESET_MS);
      }
    },
    [
      category,
      commitDownloadSlot,
      handleLockedAction,
      hasPremiumAccess,
      id,
      isLocked,
      requestDownloadSlot,
      requestPremiumAccess,
      scheduleReset,
      src,
    ]
  );

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
  };
}
