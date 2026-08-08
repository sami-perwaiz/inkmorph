"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  CrownGoldIcon,
  DownloadIcon,
  LockIcon,
  SpinnerIcon,
} from "@/components/icons/ActionIcons";
import { ACTION, type DownloadSize } from "@/lib/constants";
import {
  getCopyButtonState,
  getDownloadButtonState,
  type ActionButtonState,
  type CardActionState,
} from "@/types/action";

interface ActionOverlayProps {
  actionState: CardActionState;
  failedAction?: "copy" | "download" | null;
  visible: boolean;
  statusMessage?: string;
  locked?: boolean;
  onCopy: () => void;
  onDownload: (size?: DownloadSize) => void;
  onLockedAction: () => void;
}

const COMPACT_BTN =
  "box-border inline-flex shrink-0 items-center justify-center border border-solid border-action-border-default bg-white text-gray-900 shadow-[0px_1px_2px_rgba(10,13,18,0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 desktop:hover:border-gray-300 desktop:hover:shadow-action-hover";

function CompactIcon({
  state,
  locked,
  defaultIcon,
}: {
  state: ActionButtonState;
  locked: boolean;
  defaultIcon: ReactNode;
}) {
  if (locked && state === "default") {
    return <LockIcon />;
  }

  if (state === "loading") {
    return <SpinnerIcon />;
  }

  if (state === "success") {
    return <CheckIcon />;
  }

  return defaultIcon;
}

function ActionOverlayComponent({
  actionState,
  failedAction = null,
  visible,
  statusMessage = "",
  locked = false,
  onCopy,
  onDownload,
  onLockedAction,
}: ActionOverlayProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<DownloadSize>("1x");
  const menuId = useId();
  const sizeControlRef = useRef<HTMLDivElement>(null);

  const copyState = getCopyButtonState(actionState, failedAction);
  const downloadState = getDownloadButtonState(actionState, failedAction);
  const isBusy =
    actionState === "copying" ||
    actionState === "downloading" ||
    actionState === "copied" ||
    actionState === "downloaded";
  const downloadCompact =
    downloadState === "loading" || downloadState === "success";

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
        sizeControlRef.current &&
        !sizeControlRef.current.contains(event.target as Node)
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

  const handleCopyClick = useCallback(() => {
    if (locked) {
      onLockedAction();
      return;
    }

    onCopy();
  }, [locked, onCopy, onLockedAction]);

  const handleSizeToggle = useCallback(() => {
    if (locked) {
      onLockedAction();
      return;
    }

    if (isBusy) {
      return;
    }

    setMenuOpen((open) => !open);
  }, [isBusy, locked, onLockedAction]);

  const handleSelectSize = useCallback(
    (size: DownloadSize) => {
      setSelectedSize(size);
      setMenuOpen(false);
      onDownload(size);
    },
    [onDownload]
  );

  return (
    <div
      className="motion-overlay-root absolute inset-0 z-10 rounded-2xl"
      data-visible={visible ? "true" : "false"}
    >
      <div
        className="motion-overlay-scrim pointer-events-none absolute inset-x-0 bottom-0 h-1/2 rounded-b-2xl bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.05)]"
        aria-hidden
      />

      <div
        className="motion-overlay-panel absolute flex items-center"
        style={{
          right: ACTION.compactInset,
          bottom: ACTION.compactInset,
          gap: ACTION.compactGap,
        }}
      >
        <button
          type="button"
          className={[COMPACT_BTN, "motion-overlay-button"].join(" ")}
          style={{
            paddingLeft: ACTION.compactPx,
            paddingRight: ACTION.compactPx,
            paddingTop: ACTION.compactPy,
            paddingBottom: ACTION.compactPy,
            borderRadius: ACTION.compactRadius,
          }}
          aria-label={locked ? "Unlock to copy" : "Copy image"}
          disabled={
            !locked &&
            (copyState === "loading" || copyState === "success")
          }
          onClick={(event) => {
            event.stopPropagation();
            handleCopyClick();
          }}
        >
          <CompactIcon
            state={copyState}
            locked={locked}
            defaultIcon={<CopyIcon />}
          />
        </button>

        <div ref={sizeControlRef} className="relative">
          <button
            type="button"
            className={[
              COMPACT_BTN,
              "motion-overlay-button font-poppins text-sm font-normal leading-5",
              locked ? "text-[#797979]" : "text-[#0a0a0a]",
            ].join(" ")}
            style={{
              gap: ACTION.compactDividerGap,
              paddingLeft: ACTION.compactPx,
              paddingRight: ACTION.compactPx,
              paddingTop: ACTION.compactPy,
              paddingBottom: ACTION.compactPy,
              borderRadius: ACTION.compactRadius,
            }}
            aria-label={
              locked
                ? "Unlock to download"
                : downloadCompact
                  ? downloadState === "loading"
                    ? "Downloading"
                    : "Downloaded"
                  : `Download size ${selectedSize}`
            }
            aria-haspopup={locked || downloadCompact ? undefined : "menu"}
            aria-expanded={
              locked || downloadCompact ? undefined : menuOpen
            }
            aria-controls={
              locked || downloadCompact ? undefined : menuId
            }
            disabled={
              !locked &&
              (downloadState === "loading" || downloadState === "success")
            }
            onClick={(event) => {
              event.stopPropagation();
              handleSizeToggle();
            }}
          >
            {downloadCompact ? (
              <CompactIcon
                state={downloadState}
                locked={false}
                defaultIcon={<ChevronDownIcon />}
              />
            ) : (
              <>
                <span className="whitespace-nowrap">{selectedSize}</span>
                <span
                  className="h-5 w-px shrink-0 bg-[#EAEAEA]"
                  aria-hidden
                />
                {locked ? <LockIcon /> : <ChevronDownIcon />}
              </>
            )}
          </button>

          {menuOpen && !locked && !downloadCompact && (
            <div
              id={menuId}
              role="menu"
              aria-label="Download size"
              className="absolute bottom-[calc(100%+8px)] right-0 z-20 flex w-20 flex-col gap-[3px] rounded-lg border border-solid border-[#F5F5F5] bg-white p-1"
              onClick={(event) => event.stopPropagation()}
            >
              {/* Figma 40004699:9300 — 1x selected + download; 2x gold + crown */}
              <button
                type="button"
                role="menuitem"
                className={[
                  "flex w-full items-center justify-between rounded-md px-1.5 py-1 font-poppins text-sm font-normal leading-5",
                  selectedSize === "1x"
                    ? "bg-[#F5F5F5] text-[#0a0a0a]"
                    : "bg-transparent text-[#0a0a0a] hover:bg-[#F5F5F5]",
                ].join(" ")}
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
                className="flex w-full items-center justify-between rounded-md px-1.5 py-1 font-poppins text-sm font-normal leading-5 text-[#F5C400] hover:bg-[#F5F5F5]"
                onClick={() => handleSelectSize("2x")}
              >
                <span className="min-w-0 flex-1 truncate text-left">2x</span>
                <CrownGoldIcon />
              </button>
            </div>
          )}
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {statusMessage}
      </span>
    </div>
  );
}

export const ActionOverlay = memo(ActionOverlayComponent);
