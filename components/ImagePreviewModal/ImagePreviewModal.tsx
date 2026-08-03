"use client";

import Image from "next/image";
import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";

import { ActionButton } from "@/components/ActionButton/ActionButton";
import { useCardAction } from "@/hooks/useCardAction";
import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";
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

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ).filter((element) => {
    if (element.getAttribute("aria-hidden") === "true") {
      return false;
    }

    if (element.tabIndex < 0) {
      return false;
    }

    return element.offsetParent !== null || element === document.activeElement;
  });
}

function ImagePreviewModalComponent({
  illustration,
  visible,
  onClose,
  onExitComplete,
}: ImagePreviewModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const visibleRef = useRef(visible);
  const hasOpenedRef = useRef(false);
  const exitFinishedRef = useRef(false);
  const titleId = useId();

  const { actionState, failedAction, statusMessage, handleCopy, handleDownload } =
    useCardAction(illustration);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    setIsImageLoaded(false);
  }, [illustration.src]);

  const handlePreviewImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      if (!(img.complete && img.naturalWidth > 0)) {
        return;
      }

      const reveal = () => {
        markIllustrationImageLoaded(illustration.src);
        setIsImageLoaded(true);
      };

      if (hasIllustrationImageLoaded(illustration.src)) {
        setIsImageLoaded(true);
        return;
      }

      if (typeof img.decode === "function") {
        img.decode().then(reveal).catch(reveal);
        return;
      }

      reveal();
    },
    [illustration.src]
  );

  useEffect(() => {
    visibleRef.current = visible;

    if (visible) {
      hasOpenedRef.current = true;
      exitFinishedRef.current = false;
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    document.body.style.overflow = "hidden";

    const frame = window.requestAnimationFrame(() => {
      const focusables = rootRef.current
        ? getFocusableElements(rootRef.current)
        : [];
      focusables[0]?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !rootRef.current) {
        return;
      }

      const focusables = getFocusableElements(rootRef.current);

      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [visible, onClose]);

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

  const handleCardKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      event.stopPropagation();
    },
    []
  );

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
      aria-labelledby={titleId}
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
        onKeyDown={handleCardKeyDown}
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
          {!isImageLoaded && (
            <div className="gallery-card-skeleton absolute inset-0" aria-hidden />
          )}
          <Image
            key={illustration.id}
            src={illustration.src}
            alt={illustration.alt}
            fill
            sizes="(min-width: 834px) 400px, 302px"
            className={[
              "gallery-card-image object-cover",
              isImageLoaded ? "opacity-100" : "opacity-0",
            ].join(" ")}
            priority
            decoding="async"
            draggable={false}
            onLoad={handlePreviewImageLoad}
          />
        </div>

        <p id={titleId} className="sr-only">
          {illustration.alt}
        </p>

        <div
          className="flex w-full flex-col items-start tablet:w-[400px]"
          style={{ gap: MOBILE_MODAL.buttonGap }}
        >
          <ActionButton
            variant="copy"
            state={getCopyButtonState(actionState, failedAction)}
            onClick={handleCopy}
            className="!w-full"
          />
          <ActionButton
            variant="download"
            state={getDownloadButtonState(actionState, failedAction)}
            onClick={handleDownload}
            className="!w-full"
          />
        </div>

        <span className="sr-only" aria-live="polite">
          {statusMessage}
        </span>
      </div>
    </div>,
    document.body
  );
}

export const ImagePreviewModal = memo(ImagePreviewModalComponent);

export { MOBILE_MODAL };
