"use client";

import { memo, useEffect, useRef, useState } from "react";

import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  SpinnerIcon,
} from "@/components/icons/ActionIcons";
import { ACTION } from "@/lib/constants";
import { MOTION } from "@/lib/motion";
import {
  ACTION_BUTTON_LABELS,
  type ActionButtonState,
  type ActionButtonVariant,
} from "@/types/action";

function getIcon(variant: ActionButtonVariant, state: ActionButtonState) {
  if (state === "loading") {
    return <SpinnerIcon />;
  }

  if (state === "success") {
    return <CheckIcon />;
  }

  if (variant === "copy") {
    return <CopyIcon />;
  }

  return <DownloadIcon />;
}

function getCrossfadeDuration(
  from: ActionButtonState,
  to: ActionButtonState
): number {
  if (to === "success") {
    return MOTION.duration.actionToSuccess;
  }

  if (
    to === "loading" ||
    from === "loading" ||
    from === "success" ||
    to === "error"
  ) {
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
  const isInteractive =
    state === "default" || state === "hover" || state === "error";
  const isLoading = state === "loading";
  const isHoverForced = state === "hover";
  const isError = state === "error";
  const isDisabled = Boolean(disabled) || isLoading || state === "success";

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
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      disabled={isDisabled}
      aria-label={ACTION_BUTTON_LABELS[variant][state]}
      aria-busy={isLoading || undefined}
      className={[
        "motion-action-button box-border inline-flex shrink-0 items-center justify-center border border-solid bg-white font-inter text-sm font-normal leading-6",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2",
        isLoading || isError ? "text-gray-loading" : "text-gray-900",
        isInteractive
          ? "border-action-border-default desktop:hover:border-gray-300 desktop:hover:shadow-action-hover desktop:active:border-gray-300 desktop:active:shadow-action-hover"
          : "border-action-border-default",
        isHoverForced ? "border-gray-300 shadow-action-hover" : "",
        isDisabled ? "cursor-not-allowed opacity-60" : "",
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
          contentVisible
            ? "motion-action-content-visible"
            : "motion-action-content-hidden",
        ].join(" ")}
        style={{
          gap: ACTION.buttonGapIcon,
          transitionDuration: `${contentTransitionMs}ms`,
        }}
      >
        <span className="shrink-0">{icon}</span>
        <span className="whitespace-nowrap">{label}</span>
      </span>
    </button>
  );
}

export const ActionButton = memo(ActionButtonComponent);
