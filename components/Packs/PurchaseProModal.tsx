"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { InkMorphLogo } from "@/components/InkMorphLogo/InkMorphLogo";
import { getModalBackdropStyle } from "@/lib/modalBackdrop";
import { MOTION } from "@/lib/motion";
import { PURCHASE_MODAL } from "@/lib/purchaseModalTokens";

interface PurchaseProModalProps {
  open: boolean;
  onClose: () => void;
  /** Defaults to pricing plans anchor. */
  purchaseHref?: string;
}

/** Figma 40004981:9740 — premium icon pack purchase prompt. */
function PurchaseProModalComponent({
  open,
  onClose,
  purchaseHref = "/pricing#pricing-plans",
}: PurchaseProModalProps) {
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
        aria-label="Close purchase dialog"
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
            maxWidth: PURCHASE_MODAL.maxWidth,
            padding: PURCHASE_MODAL.padding,
            borderRadius: PURCHASE_MODAL.radius,
            gap: PURCHASE_MODAL.stackGap,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: PURCHASE_MODAL.headerGap }}
          >
            <InkMorphLogo
              size={PURCHASE_MODAL.logoSize}
              radius={PURCHASE_MODAL.logoRadius}
              alt=""
            />

            <div
              className="flex w-full flex-col items-center text-center"
              style={{ gap: PURCHASE_MODAL.copyGap }}
            >
              <h2
                id={titleId}
                className="w-full font-inter text-xl font-semibold leading-7"
                style={{ color: PURCHASE_MODAL.titleColor }}
              >
                You&apos;ve found a Pro feature
              </h2>
              <p
                id={descriptionId}
                className="w-full font-inter text-sm font-normal leading-5"
                style={{ color: PURCHASE_MODAL.bodyColor }}
              >
                Upgrade to Pro to unlock this and enjoy unlimited downloads,
                full packs, and the complete 3D library.
              </p>
            </div>
          </div>

          <div
            className="flex w-full flex-col"
            style={{ gap: PURCHASE_MODAL.actionsGap }}
          >
            <Link
              href={purchaseHref}
              onClick={onClose}
              className={[
                "relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-[6px]",
                "border border-solid border-[#E4E4E4] px-[18px] py-3",
                "font-poppins text-sm font-medium leading-5 text-white",
                "shadow-[1px_1px_1.5px_rgba(78,78,80,0.24)] transition-opacity hover:opacity-90",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2",
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
              <span className="relative">Upgrade to Pro</span>
              <span className="relative size-[14px] shrink-0 overflow-hidden">
                <Image
                  src="/icons/crown.png"
                  alt=""
                  width={20}
                  height={20}
                  className="absolute left-[-22%] top-[-22%] size-[144%] max-w-none"
                  aria-hidden
                />
              </span>
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
                height: PURCHASE_MODAL.buttonHeight,
                borderRadius: PURCHASE_MODAL.buttonRadius,
                color: PURCHASE_MODAL.cancelColor,
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

export const PurchaseProModal = memo(PurchaseProModalComponent);
