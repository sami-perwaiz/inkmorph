"use client";

import { memo, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import {
  formatDownloadResetCountdown,
  getRemainingMsUntilReset,
  getClientTimezoneOffsetMinutes,
} from "@/lib/dailyDownloadReset";
import { MOTION } from "@/lib/motion";

/** Figma 40004571:9074 — single responsive popup (desktop max 345px). */
const LIMIT_MODAL = {
  maxWidth: 345,
  padding: 24,
  radius: 12,
  border: "#EAEAEA",
  sectionGap: 20,
  textGap: 5,
  iconFrameSize: 52,
  iconFramePadding: 12,
  iconFrameRadius: 28,
  iconSize: 28,
  titleSize: 20,
  titleLineHeight: 28,
  bodySize: 14,
  bodyLineHeight: 21,
  bodyColor: "#797979",
  timerSize: 16,
  timerLineHeight: 24,
} as const;

function HourglassIcon() {
  return (
    <svg
      width={LIMIT_MODAL.iconSize}
      height={LIMIT_MODAL.iconSize}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <path
        d="M7.58333 8.16667H20.4167"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 23.3333V21C7 19.1435 7.7375 17.363 9.05025 16.0503C10.363 14.7375 12.1435 14 14 14C15.8565 14 17.637 14.7375 18.9497 16.0503C20.2625 17.363 21 19.1435 21 21V23.3333C21 23.6428 20.8771 23.9395 20.6583 24.1583C20.4395 24.3771 20.1428 24.5 19.8333 24.5H8.16667C7.85725 24.5 7.5605 24.3771 7.34171 24.1583C7.12292 23.9395 7 23.6428 7 23.3333Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 7V4.66667C7 4.35725 7.12292 4.0605 7.34171 3.84171C7.5605 3.62292 7.85725 3.5 8.16667 3.5H19.8333C20.1428 3.5 20.4395 3.62292 20.6583 3.84171C20.8771 4.0605 21 4.35725 21 4.66667V7C21 8.85652 20.2625 10.637 18.9497 11.9497C17.637 13.2625 15.8565 14 14 14C12.1435 14 10.363 13.2625 9.05025 11.9497C7.7375 10.637 7 8.85652 7 7Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface DailyDownloadLimitModalProps {
  open: boolean;
  resetAt: number | null;
  remaining: number;
  limit: number;
  onClose: () => void;
  onResetComplete: () => void;
}

function DailyDownloadLimitModalComponent({
  open,
  resetAt,
  remaining,
  limit,
  onClose,
  onResetComplete,
}: DailyDownloadLimitModalProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const [countdown, setCountdown] = useState("");
  const titleId = useId();
  const descriptionId = useId();
  const timerId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const resetTriggeredRef = useRef(false);

  useEffect(() => {
    if (open) {
      setIsMounted(true);
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;

      const frame = window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          setIsVisible(true);
          cardRef.current?.focus();
        });
      });

      return () => window.cancelAnimationFrame(frame);
    }

    setIsVisible(false);

    const timeout = window.setTimeout(() => {
      setIsMounted(false);
      previouslyFocusedRef.current?.focus();
    }, MOTION.duration.limitModal);

    return () => window.clearTimeout(timeout);
  }, [open]);

  useEffect(() => {
    if (!open) {
      resetTriggeredRef.current = false;
      return;
    }

    const timezoneOffsetMinutes = getClientTimezoneOffsetMinutes();

    const tick = () => {
      const targetResetAt =
        resetAt ?? Date.now() + getRemainingMsUntilReset(timezoneOffsetMinutes);
      const remainingMs = targetResetAt - Date.now();

      if (remainingMs <= 0) {
        setCountdown(formatDownloadResetCountdown(0));
        if (!resetTriggeredRef.current) {
          resetTriggeredRef.current = true;
          onResetComplete();
        }
        return;
      }

      setCountdown(formatDownloadResetCountdown(remainingMs));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [onResetComplete, open, resetAt]);

  useEffect(() => {
    if (!isMounted || !isVisible) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMounted, isVisible, onClose]);

  if (!isMounted || typeof document === "undefined") {
    return null;
  }

  const showPartialRemaining = remaining > 0 && remaining < limit;

  return createPortal(
    <div
      className={[
        "motion-limit-modal-root fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto overscroll-contain",
        "pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]",
        "pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        "tablet:pl-[max(1.5rem,env(safe-area-inset-left))] tablet:pr-[max(1.5rem,env(safe-area-inset-right))]",
        "tablet:pt-[max(1.5rem,env(safe-area-inset-top))] tablet:pb-[max(1.5rem,env(safe-area-inset-bottom))]",
      ].join(" ")}
      data-visible={isVisible ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <button
        type="button"
        className="motion-limit-modal-backdrop absolute inset-0"
        aria-label="Close daily download limit message"
        onClick={onClose}
        tabIndex={isVisible ? 0 : -1}
      />

      <div
        ref={cardRef}
        tabIndex={-1}
        className="motion-limit-modal-card relative z-10 my-auto box-border flex w-full flex-col items-center justify-center border border-solid bg-white outline-none"
        style={{
          maxWidth: LIMIT_MODAL.maxWidth,
          padding: LIMIT_MODAL.padding,
          borderRadius: LIMIT_MODAL.radius,
          borderColor: LIMIT_MODAL.border,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: LIMIT_MODAL.sectionGap }}
        >
          <div
            className="box-border flex shrink-0 items-center justify-center border border-solid bg-white"
            style={{
              width: LIMIT_MODAL.iconFrameSize,
              height: LIMIT_MODAL.iconFrameSize,
              padding: LIMIT_MODAL.iconFramePadding,
              borderRadius: LIMIT_MODAL.iconFrameRadius,
              borderColor: LIMIT_MODAL.border,
            }}
            aria-hidden
          >
            <HourglassIcon />
          </div>

          <div
            className="flex w-full min-w-0 flex-col items-center text-center"
            style={{ gap: LIMIT_MODAL.textGap }}
          >
            <h2
              id={titleId}
              className="w-full max-w-full break-words font-inter font-semibold text-black"
              style={{
                fontSize: LIMIT_MODAL.titleSize,
                lineHeight: `${LIMIT_MODAL.titleLineHeight}px`,
              }}
            >
              Daily Download Limit Reached
            </h2>

            <p
              id={descriptionId}
              className="w-full max-w-full break-words font-inter font-normal"
              style={{
                fontSize: LIMIT_MODAL.bodySize,
                lineHeight: `${LIMIT_MODAL.bodyLineHeight}px`,
                color: LIMIT_MODAL.bodyColor,
              }}
            >
              {showPartialRemaining ? (
                <>
                  You have{" "}
                  <span className="font-medium text-black">{remaining}</span>{" "}
                  free download{remaining === 1 ? "" : "s"} remaining today.
                  Select fewer assets to continue downloading.
                </>
              ) : (
                <>
                  You&apos;ve used all your free downloads for today.
                </>
              )}
            </p>

            <div className="flex w-full flex-col items-center gap-1 pt-1">
              <p
                className="font-inter font-normal"
                style={{
                  fontSize: LIMIT_MODAL.bodySize,
                  lineHeight: `${LIMIT_MODAL.bodyLineHeight}px`,
                  color: LIMIT_MODAL.bodyColor,
                }}
              >
                Downloads reset in
              </p>
              <p
                id={timerId}
                aria-live="polite"
                className="font-inter font-medium tabular-nums text-black"
                style={{
                  fontSize: LIMIT_MODAL.timerSize,
                  lineHeight: `${LIMIT_MODAL.timerLineHeight}px`,
                }}
              >
                {countdown || "—"}
              </p>
              <p
                className="font-inter font-normal"
                style={{
                  fontSize: LIMIT_MODAL.bodySize,
                  lineHeight: `${LIMIT_MODAL.bodyLineHeight}px`,
                  color: LIMIT_MODAL.bodyColor,
                }}
              >
                Come back after the reset to continue downloading.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export const DailyDownloadLimitModal = memo(DailyDownloadLimitModalComponent);
