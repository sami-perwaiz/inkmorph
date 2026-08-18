"use client";

import Image from "next/image";

import { PackBackButton } from "@/components/Packs/PackBackButton";
import { CheckIcon } from "@/components/icons/ActionIcons";
import { ACTION } from "@/lib/constants";
import { PACK_DOWNLOAD_LABEL } from "@/lib/downloadButtonLabels";

export type PackDownloadState =
  | "idle"
  | "preparing"
  | "downloading"
  | "success"
  | "error";

interface PackToolbarProps {
  selectedCount: number;
  selectionMode: boolean;
  downloadState?: PackDownloadState;
  downloadProgressPercent?: number;
  downloadErrorLabel?: string;
  isPremiumDownloadAll: boolean;
  onEnterSelectionMode: () => void;
  onExitSelection: () => void;
  onDownloadAll: () => void;
  onDownloadAllPremiumGate: () => void;
  onCancelDownload?: () => void;
}

function ToolbarCrownIcon() {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden"
      style={{
        width: ACTION.premiumCrownSize,
        height: ACTION.premiumCrownSize,
      }}
      aria-hidden
    >
      <Image
        src="/icons/crown.png"
        alt=""
        width={24}
        height={24}
        className="absolute left-[-22%] top-[-22%] size-[144%] max-w-none"
      />
    </span>
  );
}

/** Figma 40004968:9223 / 9230 — borderless 44px toolbar actions. */
const toolbarActionClassName =
  "inline-flex h-[44px] shrink-0 items-center justify-center gap-2 rounded-[6px] bg-white px-[18px] py-[14px] font-poppins text-[14px] font-normal leading-[16px] tracking-[-0.14px] text-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

function PackDownloadProgress({
  percent,
  onCancel,
  visible,
}: {
  percent: number;
  onCancel: () => void;
  visible: boolean;
}) {
  return (
    <div
      className={[
        "flex h-[44px] w-full min-w-0 items-center gap-3 transition-opacity duration-300 ease-out",
        visible ? "opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <div
        className="min-w-[88px] flex-1"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Pack download progress"
      >
        <div className="h-[6px] w-full overflow-hidden rounded-full bg-[#EAEAEA]">
          <div
            className="h-full rounded-full bg-black transition-[width] duration-300 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
      <span className="shrink-0 font-poppins text-[14px] font-normal leading-[16px] tracking-[-0.14px] tabular-nums text-black">
        {percent}%
      </span>
      <button
        type="button"
        onClick={onCancel}
        className={toolbarActionClassName}
      >
        Cancel
      </button>
    </div>
  );
}

/** Figma 40004968:9234 — 1340×84 toolbar (44px row + 20px vertical padding). */
export function PackToolbar({
  selectedCount,
  selectionMode,
  downloadState = "idle",
  downloadProgressPercent = 0,
  downloadErrorLabel,
  isPremiumDownloadAll,
  onEnterSelectionMode,
  onExitSelection,
  onDownloadAll,
  onDownloadAllPremiumGate,
  onCancelDownload,
}: PackToolbarProps) {
  const downloadDisabled = selectionMode && selectedCount === 0;
  const isDownloading = downloadState === "downloading";
  const isBusy = isDownloading;
  const isSuccess = downloadState === "success";
  const isError = downloadState === "error";
  const downloadLabel = selectionMode ? "Download Selected" : "Download All";

  const downloadButtonLabel = isSuccess
    ? PACK_DOWNLOAD_LABEL.downloaded
    : isError
      ? (downloadErrorLabel ?? PACK_DOWNLOAD_LABEL.error)
      : downloadLabel;

  const handleDownloadAllClick = () => {
    if (isBusy) {
      return;
    }

    if (selectionMode || isPremiumDownloadAll) {
      onDownloadAll();
      return;
    }

    onDownloadAllPremiumGate();
  };

  const downloadControl = (
    <div className="relative h-[44px] w-[min(72vw,360px)] shrink-0">
      <div className="absolute inset-0">
        <PackDownloadProgress
          percent={downloadProgressPercent}
          visible={isDownloading}
          onCancel={() => onCancelDownload?.()}
        />
      </div>
      <button
        type="button"
        onClick={handleDownloadAllClick}
        disabled={downloadDisabled || isSuccess || isDownloading}
        aria-busy={isBusy}
        aria-label={
          selectionMode
            ? "Download Selected"
            : isPremiumDownloadAll
              ? "Download All"
              : "Download All — Premium feature"
        }
        className={[
          toolbarActionClassName,
          "absolute inset-0 w-full transition-opacity duration-300 ease-out",
          isDownloading ? "pointer-events-none opacity-0" : "opacity-100",
        ].join(" ")}
      >
        {isSuccess ? <CheckIcon className="size-4 shrink-0" /> : null}
        <span className="max-w-[min(52vw,220px)] truncate">{downloadButtonLabel}</span>
        {!selectionMode &&
        !isPremiumDownloadAll &&
        !isBusy &&
        !isSuccess &&
        !isError ? (
          <ToolbarCrownIcon />
        ) : null}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-x-0 top-[71px] z-40 w-full bg-white desktop:top-[91px]">
      <div className="flex w-full min-w-0 max-w-[1340px] overflow-x-hidden px-4 py-3 tablet:mx-auto tablet:px-[50px] tablet:py-5">
        <div className="flex min-h-[44px] w-full min-w-0 items-center justify-between gap-2">
          {!selectionMode ? (
            <PackBackButton href="/packs" ariaLabel="Back to icon packs" />
          ) : null}

          <div
            className={[
              "flex h-[44px] min-w-0 items-center justify-end gap-2 tablet:gap-0",
              selectionMode ? "w-full" : "shrink",
            ].join(" ")}
          >
            {selectionMode ? (
              <>
                {downloadControl}
                <p
                  aria-live="polite"
                  aria-atomic
                  className="shrink-0 whitespace-nowrap font-poppins text-[16px] font-normal leading-[18px] text-black opacity-50 tabular-nums tablet:ml-4"
                >
                  {selectedCount} Selected
                </p>
                <button
                  type="button"
                  onClick={onExitSelection}
                  disabled={isBusy}
                  className={[toolbarActionClassName, "tablet:ml-4"].join(" ")}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {downloadControl}
                <button
                  type="button"
                  onClick={onEnterSelectionMode}
                  disabled={isBusy}
                  className={[toolbarActionClassName, "tablet:ml-4"].join(" ")}
                >
                  Select
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
