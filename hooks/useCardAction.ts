"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  copyImageToClipboard,
  downloadImage,
  getDownloadFilename,
} from "@/lib/illustrationActions";
import { ACTION } from "@/lib/constants";
import type { CardActionState } from "@/types/action";
import type { Illustration } from "@/types/illustration";

const SUCCESS_RESET_MS = ACTION.successResetMs;

export function useCardAction(illustration: Illustration) {
  const { id, src, filename } = illustration;
  const [actionState, setActionState] = useState<CardActionState>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearResetTimer = useCallback(() => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback(() => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setActionState("idle");
    }, SUCCESS_RESET_MS);
  }, [clearResetTimer]);

  useEffect(() => clearResetTimer, [clearResetTimer]);

  const handleCopy = useCallback(async () => {
    if (actionState !== "idle") {
      return;
    }

    setActionState("copying");

    try {
      await copyImageToClipboard(src, id);
      setActionState("copied");
      scheduleReset();
    } catch {
      setActionState("idle");
    }
  }, [actionState, id, scheduleReset, src]);

  const handleDownload = useCallback(async () => {
    if (actionState !== "idle") {
      return;
    }

    setActionState("downloading");

    try {
      await downloadImage(src, getDownloadFilename(id, filename));
      setActionState("downloaded");
      scheduleReset();
    } catch {
      setActionState("idle");
    }
  }, [actionState, filename, id, scheduleReset, src]);

  const showOverlay =
    isHovered || actionState === "copying" || actionState === "downloading" ||
    actionState === "copied" || actionState === "downloaded";

  return {
    actionState,
    isHovered,
    showOverlay,
    setIsHovered,
    handleCopy,
    handleDownload,
  };
}
