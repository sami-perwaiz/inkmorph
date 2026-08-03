"use client";

import Image from "next/image";
import { memo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { ActionButton } from "@/components/ActionButton/ActionButton";
import { useCardAction } from "@/hooks/useCardAction";
import { MOTION } from "@/lib/motion";
import {
  getCopyButtonState,
  getDownloadButtonState,
} from "@/types/action";
import type { Illustration } from "@/types/illustration";

/** Figma 40004539:8025 — mobile/tablet image open state. */
const MOBILE_MODAL = {
  width: 350,
  padding: 24,
  sectionGap: 24,
  radius: 12,
  border: "#EAEAEA",
  buttonGap: 20,
} as const;

interface ImagePreviewModalProps {
  illustration: Illustration;
  visible: boolean;
  onClose: () => void;
  onExitComplete: () => void;
}

function ImagePreviewModalComponent({
  illustration,
  visible,
  onClose,
  onExitComplete,
}: ImagePreviewModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef(visible);
  const hasOpenedRef = useRef(false);
  const exitFinishedRef = useRef(false);

  const { actionState, handleCopy, handleDownload } = useCardAction(illustration);

  useEffect(() => {
    visibleRef.current = visible;

    if (visible) {
      hasOpenedRef.current = true;
      exitFinishedRef.current = false;
    }
  }, [visible]);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (visible || !hasOpenedRef.current) {
      return;
    }

    let disposed = false;
    let removeListener: (() => void) | undefined;

    const finishExit = () => {
      if (disposed || exitFinishedRef.current || visibleRef.current) {
        return;
      }

      exitFinishedRef.current = true;
      onExitComplete();
    };

    const frame = window.requestAnimationFrame(() => {
      if (disposed) {
        return;
      }

      const card = rootRef.current?.querySelector(".motion-preview-modal-card");

      if (!card) {
        finishExit();
        return;
      }

      const handleTransitionEnd = (event: Event) => {
        if (event.target !== card || !(event instanceof TransitionEvent)) {
          return;
        }

        if (event.propertyName !== "opacity") {
          return;
        }

        finishExit();
      };

      card.addEventListener("transitionend", handleTransitionEnd);
      removeListener = () => {
        card.removeEventListener("transitionend", handleTransitionEnd);
      };
    });

    const fallbackTimer = window.setTimeout(() => {
      finishExit();
    }, MOTION.duration.previewModal + 48);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallbackTimer);
      removeListener?.();
    };
  }, [visible, onExitComplete]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={rootRef}
      className="motion-preview-modal-root fixed inset-0 z-[100]"
      data-visible={visible ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-label={illustration.alt}
      aria-hidden={!visible}
    >
      <button
        type="button"
        className="motion-preview-modal-backdrop absolute inset-0"
        aria-label="Close image preview"
        onClick={onClose}
        tabIndex={visible ? 0 : -1}
      />

      <div
        className={[
          "motion-preview-modal-card absolute left-1/2 top-1/2 box-border flex flex-col items-start border border-solid bg-white",
          "w-[350px] max-w-[calc(100vw-40px)]",
          "tablet:w-[448px] tablet:max-w-[calc(100vw-80px)]",
        ].join(" ")}
        style={{
          padding: MOBILE_MODAL.padding,
          gap: MOBILE_MODAL.sectionGap,
          borderRadius: MOBILE_MODAL.radius,
          borderColor: MOBILE_MODAL.border,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={[
            "relative aspect-square w-full shrink-0 overflow-hidden border border-solid bg-white",
            "tablet:size-[400px] tablet:w-[400px]",
          ].join(" ")}
          style={{
            borderRadius: MOBILE_MODAL.radius,
            borderColor: MOBILE_MODAL.border,
          }}
        >
          <Image
            src={illustration.src}
            alt={illustration.alt}
            fill
            sizes="(min-width: 834px) 400px, 302px"
            className="object-cover"
            priority
          />
        </div>

        <div
          className="flex w-full flex-col items-start tablet:w-[400px]"
          style={{ gap: MOBILE_MODAL.buttonGap }}
        >
          <ActionButton
            variant="copy"
            state={getCopyButtonState(actionState)}
            onClick={handleCopy}
            className="!w-full"
          />
          <ActionButton
            variant="download"
            state={getDownloadButtonState(actionState)}
            onClick={handleDownload}
            className="!w-full"
          />
        </div>
      </div>
    </div>,
    document.body
  );
}

export const ImagePreviewModal = memo(ImagePreviewModalComponent);

export { MOBILE_MODAL };
