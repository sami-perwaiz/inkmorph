"use client";

import Image from "next/image";

import { PackBackButton } from "@/components/Packs/PackBackButton";
import { CheckIcon } from "@/components/icons/ActionIcons";
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

const TOOLBAR_ACTION_CLASS =
  "inline-flex h-[44px] shrink-0 items-center justify-center rounded-[6px] px-[18px] py-[14px] font-poppins text-[14px] font-medium leading-[20px] text-[#494949] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const TOOLBAR_ACTION_BORDER_CLASS = `${TOOLBAR_ACTION_CLASS} border border-solid border-[#EAEAEA] bg-white`;

function ToolbarCrownIcon() {
  return (
    <span
      className="relative inline-flex size-[14px] shrink-0 items-center justify-center overflow-hidden"
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

function CancelDownloadButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-[44px] shrink-0 cursor-pointer items-center gap-[10px] rounded-[6px] border border-solid border-[#EAEAEA] bg-white px-[10px] font-poppins text-[14px] font-normal leading-[16px] tracking-[-0.14px] text-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2"
    >
      <Image
        src="/icons/close.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 shrink-0"
        aria-hidden
      />
      Cancel Download
    </button>
  );
}

function DownloadProgressGroup({ percent }: { percent: number }) {
  const clampedProgress = Math.max(0, Math.min(100, percent));
  const percentLabel = `${Math.round(clampedProgress)}%`;
  // Figma 40005086:9118 shows a ~3% sliver at 0% (right-[97.18%] on the fill).
  const visualProgress = clampedProgress === 0 ? 2.82 : clampedProgress;

  return (
    <div
      className="flex h-5 w-[220px] shrink-0 items-center gap-[12px]"
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Download progress ${percentLabel}`}
    >
      <div className="relative h-2 min-w-px flex-[1_0_0] rounded-[8px]">
        <div className="absolute inset-x-0 top-0 h-2 rounded-[4px] bg-[#F5F5F5]" />
        <div
          className="absolute left-0 top-0 h-2 rounded-[4px] bg-black transition-[width] duration-150 ease-out"
          style={{ width: `${visualProgress}%` }}
        />
      </div>
      <span className="shrink-0 whitespace-nowrap font-inter text-[14px] font-medium leading-[20px] text-[#494949]">
        {percentLabel}
      </span>
    </div>
  );
}

function DownloadCompletedState() {
  return (
    <div className="inline-flex h-[44px] shrink-0 items-center justify-center gap-2 rounded-[6px] px-[18px] py-[14px]">
      <span className="font-poppins text-[14px] font-medium leading-[20px] text-[#494949]">
        {PACK_DOWNLOAD_LABEL.downloaded}
      </span>
      <CheckIcon className="size-6 shrink-0 text-[#494949]" />
    </div>
  );
}

/** Figma 40005086:9142 — pack icon toolbar (default, selection, downloading, completed). */
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
  const isDownloading =
    downloadState === "preparing" || downloadState === "downloading";
  const isSuccess = downloadState === "success";
  const isError = downloadState === "error";
  const isBusy = isDownloading;

  const handleDownloadAllClick = () => {
    if (isBusy || isSuccess) {
      return;
    }

    if (selectionMode || isPremiumDownloadAll) {
      onDownloadAll();
      return;
    }

    onDownloadAllPremiumGate();
  };

  const showPremiumCrown =
    !selectionMode && !isPremiumDownloadAll && !isBusy && !isSuccess && !isError;

  const downloadAllButton = (
    <button
      type="button"
      onClick={handleDownloadAllClick}
      disabled={downloadDisabled || isSuccess || isBusy}
      aria-busy={isBusy}
      aria-label={
        selectionMode
          ? "Download All"
          : isPremiumDownloadAll
            ? "Download All"
            : "Download All — Premium feature"
      }
      className={`${TOOLBAR_ACTION_BORDER_CLASS} gap-2`}
    >
      Download All
      {showPremiumCrown ? <ToolbarCrownIcon /> : null}
    </button>
  );

  const errorButton = (
    <button
      type="button"
      onClick={handleDownloadAllClick}
      className={TOOLBAR_ACTION_BORDER_CLASS}
    >
      {downloadErrorLabel ?? PACK_DOWNLOAD_LABEL.error}
    </button>
  );

  const leftControl = isDownloading ? (
    <CancelDownloadButton onClick={() => onCancelDownload?.()} />
  ) : selectionMode ? (
    <PackBackButton
      ariaLabel="Exit selection"
      onClose={onExitSelection}
    />
  ) : (
    <PackBackButton href="/packs" ariaLabel="Back to icon packs" />
  );

  const rightControl = isDownloading ? (
    <DownloadProgressGroup percent={downloadProgressPercent} />
  ) : isSuccess ? (
    <DownloadCompletedState />
  ) : isError ? (
    errorButton
  ) : selectionMode ? (
    <>
      {downloadAllButton}
      <span
        aria-live="polite"
        aria-atomic
        className="inline-flex h-[44px] shrink-0 items-center font-poppins text-[16px] font-normal leading-[20px] text-[#494949]/50 tabular-nums"
      >
        {selectedCount} Selected
      </span>
      <button
        type="button"
        onClick={onExitSelection}
        disabled={isBusy}
        className={TOOLBAR_ACTION_BORDER_CLASS}
      >
        Cancel
      </button>
    </>
  ) : (
    <>
      {downloadAllButton}
      <button
        type="button"
        onClick={onEnterSelectionMode}
        disabled={isBusy}
        className={TOOLBAR_ACTION_BORDER_CLASS}
      >
        Select
      </button>
    </>
  );

  return (
    <div className="fixed inset-x-0 top-[71px] z-40 w-full bg-white desktop:top-[91px]">
      <div className="mx-auto flex w-full min-w-0 max-w-[1340px] overflow-x-hidden px-4 py-3 tablet:px-[50px] tablet:py-5">
        <div className="flex min-h-[44px] w-full min-w-0 items-center justify-between gap-4">
          {leftControl}
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 tablet:gap-4">
            {rightControl}
          </div>
        </div>
      </div>
    </div>
  );
}
