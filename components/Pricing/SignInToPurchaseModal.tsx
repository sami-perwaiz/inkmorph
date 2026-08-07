"use client";

import Link from "next/link";
import { memo, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { getModalBackdropStyle } from "@/lib/modalBackdrop";
import { MOTION } from "@/lib/motion";

/** Figma 40004878:12611 — Sign in to Purchase Pro (pricing only). */
const PURCHASE_SIGN_IN_MODAL = {
  maxWidth: 461,
  padding: 24,
  radius: 12,
  stackGap: 24,
  headerGap: 20,
  copyGap: 6,
  actionsGap: 12,
  logoSize: 42,
  logoRadius: 6,
  titleColor: "#101828",
  bodyColor: "#475467",
  cancelColor: "#414651",
  buttonBorder: "#D5D7DA",
  buttonRadius: 8,
  buttonHeight: 44,
} as const;

interface SignInToPurchaseModalProps {
  open: boolean;
  onClose: () => void;
  /** Where Sign In should return after auth (pricing page). */
  signInHref?: string;
}

function SignInToPurchaseModalComponent({
  open,
  onClose,
  signInHref = "/signin?next=/pricing",
}: SignInToPurchaseModalProps) {
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const cardRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

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

  return createPortal(
    <div
      className="motion-purchase-signin-modal-root fixed inset-0 z-[120]"
      data-visible={isVisible ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      {/*
        Backdrop is a plain div (not button) and is NOT under a parent opacity
        fade — otherwise backdrop-filter cannot sample page content behind it.
      */}
      <div
        className="motion-purchase-signin-modal-backdrop absolute inset-0"
        style={getModalBackdropStyle()}
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClose();
          }
        }}
        role="button"
        tabIndex={isVisible ? 0 : -1}
        aria-label="Close sign in dialog"
      />

      <div
        className={[
          "pointer-events-none absolute inset-0 flex items-center justify-center overflow-y-auto overscroll-contain",
          "pl-[max(1.25rem,env(safe-area-inset-left))] pr-[max(1.25rem,env(safe-area-inset-right))]",
          "pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        <div
          ref={cardRef}
          tabIndex={-1}
          className="motion-purchase-signin-modal-card pointer-events-auto relative z-10 my-auto box-border flex w-full flex-col bg-white outline-none"
          style={{
            maxWidth: PURCHASE_SIGN_IN_MODAL.maxWidth,
            padding: PURCHASE_SIGN_IN_MODAL.padding,
            borderRadius: PURCHASE_SIGN_IN_MODAL.radius,
            gap: PURCHASE_SIGN_IN_MODAL.stackGap,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: PURCHASE_SIGN_IN_MODAL.headerGap }}
          >
            <InkMorphLogo
              size={PURCHASE_SIGN_IN_MODAL.logoSize}
              radius={PURCHASE_SIGN_IN_MODAL.logoRadius}
              alt=""
            />

            <div
              className="flex w-full flex-col items-center text-center"
              style={{ gap: PURCHASE_SIGN_IN_MODAL.copyGap }}
            >
              <h2
                id={titleId}
                className="w-full font-inter text-xl font-semibold leading-7"
                style={{ color: PURCHASE_SIGN_IN_MODAL.titleColor }}
              >
                Sign in to Purchase Pro
              </h2>
              <p
                id={descriptionId}
                className="w-full font-inter text-sm font-normal leading-5"
                style={{ color: PURCHASE_SIGN_IN_MODAL.bodyColor }}
              >
                You&apos;re one step away from unlocking unlimited downloads,
                premium assets, and commercial use. Sign in with Google to
                continue securely.
              </p>
            </div>
          </div>

          <div
            className="flex w-full flex-col"
            style={{ gap: PURCHASE_SIGN_IN_MODAL.actionsGap }}
          >
            <Link
              href={signInHref}
              className={[
                "inline-flex w-full items-center justify-center border border-solid bg-white",
                "font-inter text-sm font-semibold leading-5 text-black",
                "shadow-[0px_1px_2px_0px_rgba(10,13,18,0.05)] transition-colors hover:bg-[#FAFAFA]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2",
              ].join(" ")}
              style={{
                height: PURCHASE_SIGN_IN_MODAL.buttonHeight,
                borderRadius: PURCHASE_SIGN_IN_MODAL.buttonRadius,
                borderColor: PURCHASE_SIGN_IN_MODAL.buttonBorder,
                paddingLeft: 18,
                paddingRight: 18,
              }}
            >
              Sign In
            </Link>

            <button
              type="button"
              onClick={onClose}
              className={[
                "inline-flex w-full items-center justify-center",
                "font-inter text-sm font-semibold leading-5 transition-opacity hover:opacity-80",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2",
              ].join(" ")}
              style={{
                height: PURCHASE_SIGN_IN_MODAL.buttonHeight,
                borderRadius: PURCHASE_SIGN_IN_MODAL.buttonRadius,
                color: PURCHASE_SIGN_IN_MODAL.cancelColor,
                paddingLeft: 18,
                paddingRight: 18,
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export const SignInToPurchaseModal = memo(SignInToPurchaseModalComponent);
