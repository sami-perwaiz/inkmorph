"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Illustration } from "@/types/illustration";

interface PreviewModalState {
  illustration: Illustration;
  visible: boolean;
}

/**
 * Single source of truth for the image preview modal.
 * Keeps the selected illustration mounted until the exit animation completes.
 */
export function useImagePreviewModal(isDesktop: boolean | null) {
  const [state, setState] = useState<PreviewModalState | null>(null);
  const pendingEnterRef = useRef(false);

  const open = useCallback(
    (illustration: Illustration) => {
      if (isDesktop === true) {
        return;
      }

      pendingEnterRef.current = true;
      setState({ illustration, visible: false });
    },
    [isDesktop]
  );

  const close = useCallback(() => {
    setState((current) =>
      current ? { ...current, visible: false } : current
    );
  }, []);

  const completeExit = useCallback(() => {
    setState(null);
    pendingEnterRef.current = false;
  }, []);

  useEffect(() => {
    if (!state || state.visible || !pendingEnterRef.current) {
      return;
    }

    pendingEnterRef.current = false;

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setState((current) =>
          current ? { ...current, visible: true } : current
        );
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [state]);

  useEffect(() => {
    if (isDesktop !== true) {
      return;
    }

    setState((current) =>
      current ? { ...current, visible: false } : current
    );
  }, [isDesktop]);

  return {
    illustration: state?.illustration ?? null,
    visible: state?.visible ?? false,
    isMounted: state !== null,
    open,
    close,
    completeExit,
  };
}
