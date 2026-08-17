"use client";

import Image from "next/image";

import { PackBackButton } from "@/components/Packs/PackBackButton";
import { CheckIcon, SpinnerIcon } from "@/components/icons/ActionIcons";
import { ACTION } from "@/lib/constants";

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
  downloadStatusLabel?: string;
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

/** Figma 40004968:9234 — 1340×84 toolbar (44px row + 20px vertical padding). */
export function PackToolbar({
  selectedCount,
  selectionMode,
  downloadState = "idle",
  downloadStatusLabel,
  isPremiumDownloadAll,
  onEnterSelectionMode,
  onExitSelection,
  onDownloadAll,
  onDownloadAllPremiumGate,
  onCancelDownload,
}: PackToolbarProps) {
  const downloadDisabled = selectionMode && selectedCount === 0;
  const isPreparing = downloadState === "preparing";
  const isDownloading = downloadState === "downloading";
  const isBusy = isPreparing || isDownloading;
  const isSuccess = downloadState === "success";
  const isError = downloadState === "error";
  const downloadLabel = selectionMode ? "Download Selected" : "Download All";

  const downloadButtonLabel =
    downloadStatusLabel ??
    (isPreparing
      ? "Preparing…"
      : isDownloading
        ? "Downloading…"
        : isSuccess
          ? "Downloaded"
          : isError
            ? "Download failed · Try again"
            : downloadLabel);

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
                <button
                  type="button"
                  onClick={handleDownloadAllClick}
                  disabled={downloadDisabled || isBusy || isSuccess}
                  aria-busy={isBusy}
                  className={toolbarActionClassName}
                >
                  {isBusy ? (
                    <SpinnerIcon className="size-4 shrink-0" />
                  ) : isSuccess ? (
                    <CheckIcon className="size-4 shrink-0" />
                  ) : null}
                  <span className="max-w-[min(52vw,220px)] truncate">
                    {downloadButtonLabel}
                  </span>
                </button>
                {isBusy && onCancelDownload ? (
                  <button
                    type="button"
                    onClick={onCancelDownload}
                    className="shrink-0 font-poppins text-xs font-normal leading-4 text-[#797979] underline-offset-2 hover:underline"
                  >
                    Cancel
                  </button>
                ) : null}
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
                <button
                  type="button"
                  onClick={handleDownloadAllClick}
                  disabled={isBusy || isSuccess}
                  aria-busy={isBusy}
                  aria-label={
                    isPremiumDownloadAll
                      ? "Download All"
                      : "Download All — Premium feature"
                  }
                  className={toolbarActionClassName}
                >
                  {isBusy ? (
                    <SpinnerIcon className="size-4 shrink-0" />
                  ) : isSuccess ? (
                    <CheckIcon className="size-4 shrink-0" />
                  ) : null}
                  <span className="max-w-[min(52vw,220px)] truncate">
                    {downloadButtonLabel}
                  </span>
                  {!isPremiumDownloadAll && !isBusy && !isSuccess && !isError ? (
                    <ToolbarCrownIcon />
                  ) : null}
                </button>
                {isBusy && onCancelDownload ? (
                  <button
                    type="button"
                    onClick={onCancelDownload}
                    className="shrink-0 font-poppins text-xs font-normal leading-4 text-[#797979] underline-offset-2 hover:underline tablet:ml-2"
                  >
                    Cancel
                  </button>
                ) : null}
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
