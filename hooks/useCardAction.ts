"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDownloadLimit } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import {
  copyImageToClipboard,
  downloadImage,
} from "@/lib/illustrationActions";
import { trackImageCopy, trackImageDownload } from "@/lib/analytics";
import { ACTION, type DownloadSize } from "@/lib/constants";
import type { CardActionState } from "@/types/action";
import type { Illustration } from "@/types/illustration";

const SUCCESS_RESET_MS = ACTION.successResetMs;
const ERROR_RESET_MS = 1800;

export function useCardAction(illustration: Illustration) {
  const { id, src, category, premium } = illustration;
  const router = useRouter();
  const { requestDownloadSlot, commitDownloadSlot } = useDownloadLimit();
  const [actionState, setActionState] = useState<CardActionState>("idle");
  const [failedAction, setFailedAction] = useState<"copy" | "download" | null>(
    null
  );
  const [isHovered, setIsHovered] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const actionStateRef = useRef(actionState);
  const isLocked = Boolean(premium);

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
    router.push("/pricing#pricing-plans");
  }, [router]);

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
      if (isLocked || size === "2x") {
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
      setStatusMessage("Downloading PNG");

      try {
        await downloadImage(src, `${id}.png`);
        commitDownloadSlot();
        trackImageDownload(id, category);
        setActionState("downloaded");
        setStatusMessage("Downloaded PNG");
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
      id,
      isLocked,
      requestDownloadSlot,
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
