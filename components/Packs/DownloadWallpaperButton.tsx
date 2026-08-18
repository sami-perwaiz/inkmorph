"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { CheckIcon, SpinnerIcon } from "@/components/icons/ActionIcons";
import { MOTION } from "@/lib/motion";

interface DownloadWallpaperButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  busy?: boolean;
  success?: boolean;
}

type TrailingIconState = "download" | "loading" | "success";

const BUTTON_LABEL = "Download Wallpaper";

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

/** Figma 40005094:9207 — Download Wallpaper (default / loading / done). */
export function DownloadWallpaperButton({
  onClick,
  className = "",
  disabled = false,
  busy = false,
  success = false,
}: DownloadWallpaperButtonProps) {
  const trailingState = getTrailingIconState(busy, success);
  const isInactive = disabled || busy || success;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-busy={busy}
      aria-label={
        busy
          ? "Downloading wallpaper"
          : success
            ? "Wallpaper downloaded"
            : BUTTON_LABEL
      }
      className={[
        "relative inline-flex h-[44px] w-[205px] shrink-0 items-center justify-center gap-[8px] overflow-hidden rounded-[6px] border border-solid border-[#E4E4E4] px-[18px] py-[14px]",
        "font-poppins text-sm font-normal leading-4 tracking-[-0.14px] text-white",
        "shadow-[1px_1px_1.5px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
        isInactive ? "pointer-events-none" : "",
        disabled ? "cursor-not-allowed opacity-70" : "",
        className,
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
      <span className="relative whitespace-nowrap">{BUTTON_LABEL}</span>
      <TrailingActionIcon state={trailingState} />
    </button>
  );
}
