"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { CheckIcon, SpinnerIcon } from "@/components/icons/ActionIcons";
import { MOTION } from "@/lib/motion";

interface DownloadWallpaperButtonProps {
  onClick: () => void;
  className?: string;
  label?: string;
  disabled?: boolean;
  busy?: boolean;
  success?: boolean;
  onCancel?: () => void;
}

type TrailingIconState = "download" | "loading" | "success";

function getTrailingIconState(
  busy: boolean,
  success: boolean
): TrailingIconState {
  if (success) {
    return "success";
  }

  if (busy) {
    return "loading";
  }

  return "download";
}

function getCrossfadeDuration(
  from: TrailingIconState,
  to: TrailingIconState
): number {
  if (to === "success") {
    return MOTION.duration.actionToSuccess;
  }

  if (to === "loading" || from === "loading" || from === "success") {
    return MOTION.duration.actionToDefault;
  }

  return MOTION.duration.actionToLoading;
}

function TrailingActionIcon({ state }: { state: TrailingIconState }) {
  const [displayState, setDisplayState] = useState(state);
  const [visible, setVisible] = useState(true);
  const [transitionMs, setTransitionMs] = useState(
    MOTION.duration.actionToLoading / 2
  );
  const displayStateRef = useRef(state);
  const previousStateRef = useRef(state);

  useEffect(() => {
    displayStateRef.current = displayState;
  }, [displayState]);

  useEffect(() => {
    if (state === displayStateRef.current) {
      return;
    }

    const duration = getCrossfadeDuration(previousStateRef.current, state);
    const halfDuration = duration / 2;

    setTransitionMs(halfDuration);
    setVisible(false);

    const fadeTimer = window.setTimeout(() => {
      setDisplayState(state);
      previousStateRef.current = state;
      requestAnimationFrame(() => {
        setVisible(true);
      });
    }, halfDuration);

    return () => window.clearTimeout(fadeTimer);
  }, [state]);

  return (
    <span
      className={[
        "relative inline-flex size-4 shrink-0 items-center justify-center transition-opacity",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        transitionDuration: `${transitionMs}ms`,
        transitionTimingFunction: MOTION.easePremium,
      }}
      aria-hidden
    >
      {displayState === "loading" ? (
        <SpinnerIcon className="size-4 shrink-0 brightness-0 invert" />
      ) : displayState === "success" ? (
        <CheckIcon className="size-4 shrink-0 brightness-0 invert" />
      ) : (
        <Image
          src="/icons/download.svg"
          alt=""
          width={16}
          height={16}
          className="size-full brightness-0 invert"
        />
      )}
    </span>
  );
}

/** Figma 40004968:9107 — Download Wallpaper CTA. */
export function DownloadWallpaperButton({
  onClick,
  className = "",
  label = "Download Wallpaper",
  disabled = false,
  busy = false,
  success = false,
  onCancel,
}: DownloadWallpaperButtonProps) {
  const showCancel = busy && onCancel;
  const trailingState = getTrailingIconState(busy, success);

  return (
    <div className={["flex flex-col items-center gap-2 desktop:items-start", className].join(" ")}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled || busy || success}
        aria-busy={busy}
        className={[
          "relative inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-[6px] border border-solid border-[#E4E4E4] px-[18px] py-[14px]",
          "font-poppins text-sm font-normal leading-4 tracking-[-0.14px] text-white",
          "shadow-[1px_1px_3px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-70",
        ].join(" ")}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[6px]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.4) 4.17%, rgba(99,99,99,0.4) 43.06%), linear-gradient(90deg, #000 0%, #000 100%)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_2px_2px_10px_0px_rgba(255,255,255,0.18)]"
        />
        <span className="relative inline-flex items-center gap-2">
          <span>{label}</span>
          <TrailingActionIcon state={trailingState} />
        </span>
      </button>

      {showCancel ? (
        <button
          type="button"
          onClick={onCancel}
          className="font-poppins text-xs font-normal leading-4 text-[#797979] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      ) : null}
    </div>
  );
}
