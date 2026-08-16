"use client";

import {
  useEffect,
  useState,
  type MouseEvent,
  type ReactNode,
  type TransitionEvent,
} from "react";

import { MENU_DROPDOWN_ANIMATION_CLASS } from "@/lib/navTokens";

/** Slide + fade open/close for floating dropdown panels — styling unchanged. */
export function AnimatedDropdownPanel({
  open,
  id,
  label,
  className,
  position = "below",
  connected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: {
  open: boolean;
  id: string;
  label: string;
  className: string;
  position?: "below" | "above";
  /** Bridges the navbar divider under this panel on desktop — no full-width hide. */
  connected?: boolean;
  onClick?: (event: MouseEvent<HTMLDivElement>) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
  }, [open]);

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.propertyName !== "opacity") {
      return;
    }

    if (!open) {
      setMounted(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      id={id}
      role="menu"
      aria-label={label}
      aria-hidden={!visible}
      data-open={visible ? "true" : "false"}
      data-position={position}
      className={[
        className,
        MENU_DROPDOWN_ANIMATION_CLASS,
        connected ? "motion-nav-dropdown-connected" : "",
      ].join(" ")}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onTransitionEnd={handleTransitionEnd}
    >
      {children}
    </div>
  );
}
