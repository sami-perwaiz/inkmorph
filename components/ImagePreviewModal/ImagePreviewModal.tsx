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
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";

import { AnimatedDropdownPanel } from "@/components/AnimatedDropdownPanel/AnimatedDropdownPanel";
import { ProtectedPremiumImage } from "@/components/ProtectedPremiumImage/ProtectedPremiumImage";
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  CrownGoldIcon,
  DownloadIcon,
  LockIcon,
  SpinnerIcon,
} from "@/components/icons/ActionIcons";
import { usePreviewCardAction } from "@/hooks/usePreviewCardAction";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { usePremiumAccessGate } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { shouldProtectGalleryAsset, requiresPremiumForDownloadSize } from "@/lib/premiumFeatureAccess";
import { ACTION, type DownloadSize } from "@/lib/constants";
import {
  getMenuDropdownItemClassName,
  getMenuDropdownPanelClassName,
} from "@/lib/navTokens";
import {
  hasIllustrationImageLoaded,
  markIllustrationImageLoaded,
} from "@/lib/illustrationImageCache";
import {
  IMAGE_PREVIEW_MODAL_SIZES,
  IMAGE_PREVIEW_QUALITY,
  getPreviewImageProps,
} from "@/lib/imageDelivery";
import { MOTION } from "@/lib/motion";
import { getPreviewAssetUrl } from "@/lib/previewAsset";
import { getModalBackdropStyle } from "@/lib/modalBackdrop";
import {
  getPreviewCopyLabel,
  getPreviewDownloadLabel,
} from "@/lib/downloadButtonLabels";
import type { Illustration } from "@/types/illustration";
import type { PreviewActionState } from "@/hooks/usePreviewCardAction";

/** Figma Images Open State — 40004699:9098 / 40004699:9408 (+ tags 40004900:12643) */
const PREVIEW_MODAL = {
  padding: 16,
  sectionGap: 24,
  mediaGap: 12,
  actionGap: 12,
  tagGap: 8,
  radius: 12,
  border: "#EAEAEA",
  actionBorder: "#F5F5F5",
  imageSize: 400,
  actionPx: 12,
  actionPy: 10,
  actionRadius: 8,
  iconLabelGap: 6,
  premiumBadgePad: 8,
  premiumBadgeRadius: 6,
  premiumCrownSize: 20,
  tagMax: 4,
  tagPx: 6,
  tagPy: 3,
  tagRadius: 6,
  tagBg: "#F5F5F5",
  tagColor: "#5B5B5B",
} as const;

/** Figma preview hashtags — up to 4 tags (`#house`, `#3d-home`, …). */
function getPreviewTags(illustration: Illustration): string[] {
  const unique: string[] = [];

  for (const tag of illustration.tags ?? []) {
    const slug = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug || unique.includes(slug)) {
      continue;
    }
    unique.push(slug);
  }

  const primary = unique.filter((tag) => !tag.startsWith("3d-"));
  const with3d = unique.filter((tag) => tag.startsWith("3d-"));
  const ordered = [
    ...primary.slice(0, 2),
    ...with3d.slice(0, 2),
    ...primary.slice(2),
    ...with3d.slice(2),
  ];

  return [...new Set(ordered)]
    .slice(0, PREVIEW_MODAL.tagMax)
    .map((tag) => `#${tag}`);
}

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

function PreviewActionIcon({
  actionState,
  failedAction,
  locked,
  showCopySpinner = false,
  successState,
  defaultIcon,
}: {
  actionState: PreviewActionState;
  failedAction: "copy" | "download" | null;
  locked: boolean;
  showCopySpinner?: boolean;
  successState: PreviewActionState;
  defaultIcon: ReactNode;
}) {
  if (locked && (actionState === "idle" || actionState === "error")) {
    return <LockIcon />;
  }

  if (showCopySpinner) {
    return <SpinnerIcon />;
  }

  if (actionState === successState) {
    return <CheckIcon />;
  }

  if (actionState === "error" && failedAction) {
    return defaultIcon;
  }

  return defaultIcon;
}

function PreviewPremiumBadge() {
  return (
    <div
      className="pointer-events-none absolute z-[2] flex items-center justify-center shadow-[0px_8px_8px_-4px_rgba(10,13,18,0.08),0px_20px_24px_-4px_rgba(10,13,18,0.14)]"
      style={{
        left: ACTION.compactInset,
        bottom: ACTION.compactInset,
        padding: PREVIEW_MODAL.premiumBadgePad,
        borderRadius: PREVIEW_MODAL.premiumBadgeRadius,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(99,99,99,0.2) 100%), linear-gradient(90deg, #000 0%, #000 100%)",
      }}
      aria-hidden
    >
      <span
        className="relative shrink-0 overflow-hidden"
        style={{
          width: PREVIEW_MODAL.premiumCrownSize,
          height: PREVIEW_MODAL.premiumCrownSize,
        }}
      >
        <Image
          src="/icons/crown.png"
          alt=""
          width={28}
          height={28}
          className="absolute left-[-22%] top-[-22%] size-[144%] max-w-none"
        />
      </span>
    </div>
  );
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
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const menuId = useId();

  const {
    actionState,
    failedAction,
    isLocked,
    showCopySpinner,
    handleCopy,
    handleDownload,
    handleLockedAction,
  } = usePreviewCardAction(illustration);

  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const { requestPremiumAccess } = usePremiumAccessGate();

  const previewSrc = getPreviewAssetUrl(illustration, "modal");

  const [isImageLoaded, setIsImageLoaded] = useState(() =>
    hasIllustrationImageLoaded(previewSrc)
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<DownloadSize>("1x");

  const hasFullLibraryAccess = isReady && hasPremiumAccess;
  const protectImage = shouldProtectGalleryAsset(
    illustration,
    hasFullLibraryAccess
  );

  const copyLabel = getPreviewCopyLabel(actionState, failedAction);
  const downloadLabel = getPreviewDownloadLabel(actionState, failedAction);
  const mutedMeta = isLocked ? "text-[#797979]" : "text-[#0a0a0a]";
  const copySucceeded = actionState === "copied";
  const downloadSucceeded = actionState === "downloaded";

  useEffect(() => {
    setIsImageLoaded(hasIllustrationImageLoaded(previewSrc));
    setMenuOpen(false);
    setSelectedSize("1x");
  }, [previewSrc]);

  useEffect(() => {
    if (!visible) {
      setMenuOpen(false);
    }
  }, [visible]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (
        sizeMenuRef.current &&
        !sizeMenuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handlePreviewImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      if (!(img.complete && img.naturalWidth > 0)) {
        return;
      }

      const reveal = () => {
        markIllustrationImageLoaded(previewSrc);
        setIsImageLoaded(true);
      };

      if (hasIllustrationImageLoaded(previewSrc)) {
        setIsImageLoaded(true);
        return;
      }

      if (typeof img.decode === "function") {
        img.decode().then(reveal).catch(reveal);
        return;
      }

      reveal();
    },
    [previewSrc]
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
        if (menuOpen) {
          event.preventDefault();
          setMenuOpen(false);
          return;
        }

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
  }, [visible, onClose, menuOpen]);

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

  const handleCopyClick = useCallback(() => {
    if (isLocked) {
      handleLockedAction();
      return;
    }

    handleCopy();
  }, [handleCopy, handleLockedAction, isLocked]);

  const handleDownloadClick = useCallback(() => {
    if (isLocked) {
      handleLockedAction();
      return;
    }

    if (isLocked || copySucceeded || downloadSucceeded) {
      return;
    }

    handleDownload(selectedSize);
  }, [copySucceeded, downloadSucceeded, handleDownload, handleLockedAction, isLocked, selectedSize]);

  const handleMenuToggle = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();

      if (isLocked || copySucceeded || downloadSucceeded) {
        return;
      }

      setMenuOpen((open) => !open);
    },
    [copySucceeded, downloadSucceeded, isLocked]
  );

  const handleSelectSize = useCallback(
    (size: DownloadSize) => {
      setMenuOpen(false);

      if (requiresPremiumForDownloadSize(size, hasPremiumAccess)) {
        requestPremiumAccess();
        return;
      }

      setSelectedSize(size);
    },
    [hasPremiumAccess, requestPremiumAccess]
  );

  if (typeof document === "undefined") {
    return null;
  }

  const previewTags = getPreviewTags(illustration);

  const rowClass =
    "box-border flex w-full items-center justify-between border border-solid border-[#F5F5F5] bg-white font-poppins text-sm text-[#202020]";

  const rowStyle = {
    paddingLeft: PREVIEW_MODAL.actionPx,
    paddingRight: PREVIEW_MODAL.actionPx,
    paddingTop: PREVIEW_MODAL.actionPy,
    paddingBottom: PREVIEW_MODAL.actionPy,
    borderRadius: PREVIEW_MODAL.actionRadius,
  } as const;

  const rowButtonClass =
    "inline-flex items-center border-0 bg-transparent p-0 font-inherit text-inherit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

  return createPortal(
    <div
      ref={rootRef}
      className="motion-preview-modal-root fixed inset-0 z-[100]"
      data-visible={visible ? "true" : "false"}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="motion-preview-modal-backdrop absolute inset-0"
        style={getModalBackdropStyle()}
        role="button"
        aria-label="Close image preview"
        tabIndex={visible ? 0 : -1}
        onClick={onClose}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onClose();
          }
        }}
      />

      <div
        className={[
          "motion-preview-modal-card absolute left-1/2 top-1/2 box-border flex w-[min(432px,calc(100vw-40px))] flex-col items-start border border-solid bg-white",
        ].join(" ")}
        style={{
          padding: PREVIEW_MODAL.padding,
          gap: PREVIEW_MODAL.sectionGap,
          borderRadius: PREVIEW_MODAL.radius,
          borderColor: PREVIEW_MODAL.border,
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleCardKeyDown}
      >
        <div
          className="flex w-full flex-col items-start"
          style={{ gap: PREVIEW_MODAL.mediaGap }}
        >
          <div
            className="relative aspect-square w-full shrink-0 overflow-hidden border border-solid bg-white"
            style={{
              borderRadius: PREVIEW_MODAL.radius,
              borderColor: PREVIEW_MODAL.actionBorder,
              maxWidth: PREVIEW_MODAL.imageSize,
            }}
          >
            {!isImageLoaded && (
              <div
                className="gallery-card-skeleton absolute inset-0"
                aria-hidden
              />
            )}
            <ProtectedPremiumImage enabled={protectImage} className="absolute inset-0">
              <Image
                key={illustration.id}
                src={previewSrc}
                alt={illustration.alt}
                fill
                sizes={IMAGE_PREVIEW_MODAL_SIZES}
                quality={IMAGE_PREVIEW_QUALITY.modal}
                className={[
                  "gallery-card-image object-cover",
                  isImageLoaded ? "opacity-100" : "opacity-0",
                ].join(" ")}
                {...getPreviewImageProps(true)}
                decoding="async"
                draggable={false}
                onLoad={handlePreviewImageLoad}
              />
            </ProtectedPremiumImage>

            {isLocked && (
              <>
                <div
                  className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden"
                  aria-hidden
                >
                  <span className="rotate-45 select-none whitespace-nowrap font-poppins text-[clamp(40px,19vw,76px)] font-semibold leading-none text-black/[0.05]">
                    Ink Morph
                  </span>
                </div>
                <PreviewPremiumBadge />
              </>
            )}
          </div>

          {previewTags.length > 0 ? (
            <ul
              className="flex max-w-full list-none flex-wrap items-start p-0"
              style={{ gap: PREVIEW_MODAL.tagGap }}
              aria-label="Asset tags"
            >
              {previewTags.map((tag) => (
                <li
                  key={tag}
                  className="inline-flex shrink-0 items-center justify-center font-inter text-xs font-medium leading-[18px]"
                  style={{
                    paddingLeft: PREVIEW_MODAL.tagPx,
                    paddingRight: PREVIEW_MODAL.tagPx,
                    paddingTop: PREVIEW_MODAL.tagPy,
                    paddingBottom: PREVIEW_MODAL.tagPy,
                    borderRadius: PREVIEW_MODAL.tagRadius,
                    backgroundColor: PREVIEW_MODAL.tagBg,
                    color: PREVIEW_MODAL.tagColor,
                  }}
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}

          <div
            className="flex w-full flex-col items-stretch"
            style={{ gap: PREVIEW_MODAL.actionGap }}
          >
            <button
              type="button"
              className={[rowClass, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"].join(" ")}
              style={rowStyle}
              aria-label={isLocked ? "Unlock to copy" : "Copy image"}
              disabled={!isLocked && copySucceeded}
              onClick={handleCopyClick}
            >
              <span
                className="inline-flex items-center"
                style={{ gap: PREVIEW_MODAL.iconLabelGap }}
              >
                <PreviewActionIcon
                  actionState={actionState}
                  failedAction={failedAction}
                  locked={isLocked}
                  showCopySpinner={showCopySpinner}
                  successState="copied"
                  defaultIcon={<CopyIcon />}
                />
                <span className="min-w-[5.5rem]">{copyLabel}</span>
              </span>
              <span className={["leading-5", mutedMeta].join(" ")}>PNG</span>
            </button>

            <div ref={sizeMenuRef} className="relative w-full">
              <div className={rowClass} style={rowStyle}>
                <button
                  type="button"
                  className={[rowButtonClass, "min-w-0 flex-1 justify-start"].join(" ")}
                  aria-label={
                    isLocked ? "Unlock to download" : downloadLabel
                  }
                  disabled={!isLocked && downloadSucceeded}
                  onClick={handleDownloadClick}
                >
                  <span
                    className="inline-flex min-w-0 items-center"
                    style={{ gap: PREVIEW_MODAL.iconLabelGap }}
                  >
                    <PreviewActionIcon
                      actionState={actionState}
                      failedAction={failedAction}
                      locked={isLocked}
                      successState="downloaded"
                      defaultIcon={<DownloadIcon />}
                    />
                    <span className="truncate">{downloadLabel}</span>
                  </span>
                </button>

                <span
                  className={["inline-flex items-center leading-5", mutedMeta].join(
                    " "
                  )}
                  style={{ gap: ACTION.compactDividerGap }}
                >
                  <span>{selectedSize}</span>
                  <span className="h-5 w-px shrink-0 bg-[#EAEAEA]" aria-hidden />
                  <button
                    type="button"
                    className={[rowButtonClass, "inline-flex shrink-0 items-center justify-center"].join(" ")}
                    aria-label="Download size options"
                    aria-haspopup={isLocked ? undefined : "menu"}
                    aria-expanded={isLocked ? undefined : menuOpen}
                    aria-controls={isLocked ? undefined : menuId}
                    disabled={isLocked || copySucceeded || downloadSucceeded}
                    onClick={handleMenuToggle}
                  >
                    <ChevronDownIcon />
                  </button>
                </span>
              </div>

              <AnimatedDropdownPanel
                open={menuOpen && !isLocked}
                id={menuId}
                label="Download size"
                position="above"
                className={getMenuDropdownPanelClassName({
                  align: "right",
                  size: "compact",
                  position: "above",
                })}
              >
                <button
                  type="button"
                  role="menuitem"
                  className={getMenuDropdownItemClassName({
                    active: selectedSize === "1x",
                    size: "compact",
                  })}
                  onClick={() => handleSelectSize("1x")}
                >
                  <span className="min-w-0 flex-1 truncate text-left">1x</span>
                  <DownloadIcon
                    width={14}
                    height={14}
                    className="size-[14px] shrink-0 text-[#202020]"
                  />
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className={getMenuDropdownItemClassName({
                    active: selectedSize === "2x",
                    premium: true,
                    size: "compact",
                  })}
                  onClick={() => handleSelectSize("2x")}
                >
                  <span className="min-w-0 flex-1 truncate text-left">2x</span>
                  <CrownGoldIcon />
                </button>
              </AnimatedDropdownPanel>
            </div>
          </div>
        </div>

        <p id={titleId} className="sr-only">
          {illustration.alt}
        </p>

        <span className="sr-only" aria-live="polite">
          {copySucceeded
            ? "Copied"
            : downloadSucceeded
              ? "Downloaded"
              : actionState === "error"
                ? failedAction === "copy"
                  ? "Copy failed"
                  : "Download failed"
                : null}
        </span>
      </div>
    </div>,
    document.body
  );
}

export const ImagePreviewModal = memo(ImagePreviewModalComponent);

export { PREVIEW_MODAL };
/** @deprecated Use PREVIEW_MODAL */
export const MOBILE_MODAL = PREVIEW_MODAL;
