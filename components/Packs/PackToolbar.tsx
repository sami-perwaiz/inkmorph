"use client";

import { PackBackButton } from "@/components/Packs/PackBackButton";

interface PackToolbarProps {
  selectedCount: number;
  selectionMode: boolean;
  onEnterSelectionMode: () => void;
  onExitSelection: () => void;
  onDownloadAll: () => void;
}

/** Figma 40004968:9223 / 9230 — borderless 44px toolbar actions. */
const toolbarActionClassName =
  "inline-flex h-[44px] shrink-0 items-center justify-center rounded-[6px] bg-white px-[18px] py-[14px] font-poppins text-[14px] font-normal leading-[16px] tracking-[-0.14px] text-black transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40";

/** Figma 40004968:9234 — 1340×84 toolbar (44px row + 20px vertical padding). */
export function PackToolbar({
  selectedCount,
  selectionMode,
  onEnterSelectionMode,
  onExitSelection,
  onDownloadAll,
}: PackToolbarProps) {
  const downloadDisabled = selectionMode && selectedCount === 0;

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
                  onClick={onDownloadAll}
                  disabled={downloadDisabled}
                  className={toolbarActionClassName}
                >
                  Download Selected
                </button>
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
                  className={[toolbarActionClassName, "tablet:ml-4"].join(" ")}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDownloadAll}
                  className={toolbarActionClassName}
                >
                  Download All
                </button>
                <button
                  type="button"
                  onClick={onEnterSelectionMode}
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
