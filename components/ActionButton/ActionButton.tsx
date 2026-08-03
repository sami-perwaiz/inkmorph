"use client";

import Image from "next/image";
import { memo, useEffect, useRef, useState } from "react";

import { ACTION } from "@/lib/constants";
import { MOTION } from "@/lib/motion";
import {
  ACTION_BUTTON_LABELS,
  type ActionButtonState,
  type ActionButtonVariant,
} from "@/types/action";

function SpinnerIcon() {
  return (
    <svg
      width={ACTION.spinnerSize}
      height={ACTION.spinnerSize}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="animate-spin"
      aria-hidden
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke="#88888C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="28 44"
      />
    </svg>
  );
}

type ActionIconName = "copy" | "download" | "check" | "spinner";

function ActionIcon({ icon }: { icon: ActionIconName }) {
  if (icon === "spinner") {
    return <SpinnerIcon />;
  }

  return (
    <span
      className="relative block shrink-0 overflow-clip"
      style={{ width: ACTION.iconSize, height: ACTION.iconSize }}
    >
      <Image
        src={`/icons/${icon}.svg`}
        alt=""
        fill
        aria-hidden
        className="object-contain"
      />
    </span>
  );
}

function getIcon(
  variant: ActionButtonVariant,
  state: ActionButtonState
): ActionIconName {
  if (state === "loading") {
    return "spinner";
  }

  if (state === "success") {
    return "check";
  }

  return variant;
}

function getCrossfadeDuration(
  from: ActionButtonState,
  to: ActionButtonState
): number {
  if (to === "success") {
    return MOTION.duration.actionToSuccess;
  }

  if (to === "loading" || from === "loading" || from === "success") {
    return MOTION.duration.actionToDefault;
  }

  return MOTION.duration.actionToLoading;
}

export type { ActionButtonVariant, ActionButtonState };

interface ActionButtonProps {
  variant: ActionButtonVariant;
  state?: ActionButtonState;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

function ActionButtonComponent({
  variant,
  state = "default",
  disabled = false,
  onClick,
  className = "",
}: ActionButtonProps) {
  const isInteractive = state === "default" || state === "hover";
  const isLoading = state === "loading";
  const isHoverForced = state === "hover";

  const [displayState, setDisplayState] = useState(state);
  const [contentVisible, setContentVisible] = useState(true);
  const [contentTransitionMs, setContentTransitionMs] = useState(
    MOTION.duration.actionToLoading / 2
  );
  const previousStateRef = useRef(state);
  const displayStateRef = useRef(state);

  useEffect(() => {
    displayStateRef.current = displayState;
  }, [displayState]);

  useEffect(() => {
    if (state === displayStateRef.current) {
      return;
    }

    const duration = getCrossfadeDuration(previousStateRef.current, state);
    const halfDuration = duration / 2;

    setContentTransitionMs(halfDuration);
    setContentVisible(false);

    const fadeTimer = window.setTimeout(() => {
      setDisplayState(state);
      previousStateRef.current = state;
      requestAnimationFrame(() => {
        setContentVisible(true);
      });
    }, halfDuration);

    return () => window.clearTimeout(fadeTimer);
  }, [state]);

  const label = ACTION_BUTTON_LABELS[variant][displayState];
  const icon = getIcon(variant, displayState);

  return (
    <button
      type="button"
      data-state={state}
      onClick={onClick}
      disabled={disabled || !isInteractive}
      aria-label={ACTION_BUTTON_LABELS[variant][state]}
      aria-busy={isLoading}
      className={[
        "motion-action-button box-border inline-flex shrink-0 items-center justify-center border border-solid bg-white font-inter text-sm font-normal leading-6",
        "focus-visible:outline-none focus-visible:border-gray-300 focus-visible:shadow-action-hover",
        isLoading ? "text-gray-loading" : "text-gray-900",
        isInteractive
          ? "border-action-border-default desktop:hover:border-gray-300 desktop:hover:shadow-action-hover desktop:active:border-gray-300 desktop:active:shadow-action-hover"
          : "border-action-border-default",
        isHoverForced ? "border-gray-300 shadow-action-hover" : "",
        disabled ? "cursor-not-allowed opacity-60" : "",
        className,
      ].join(" ")}
      style={{
        width: ACTION.buttonWidth,
        height: ACTION.buttonHeight,
        paddingTop: ACTION.buttonPy,
        paddingBottom: ACTION.buttonPy,
        paddingLeft: ACTION.buttonPx,
        paddingRight: ACTION.buttonPx,
        gap: ACTION.buttonGapIcon,
        borderRadius: ACTION.buttonRadius,
        borderWidth: 1,
      }}
    >
      <span
        className={[
          "motion-action-content inline-flex items-center",
          contentVisible ? "motion-action-content-visible" : "motion-action-content-hidden",
        ].join(" ")}
        style={{ gap: ACTION.buttonGapIcon, transitionDuration: `${contentTransitionMs}ms` }}
      >
        <span className="shrink-0">
          <ActionIcon icon={icon} />
        </span>
        <span className="whitespace-nowrap">{label}</span>
      </span>
    </button>
  );
}

export const ActionButton = memo(ActionButtonComponent);
