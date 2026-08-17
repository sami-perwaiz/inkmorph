/** Shared download button copy — single source for visible button states. */

export const PREVIEW_DOWNLOAD_LABEL = {
  idle: "Download",
  downloading: "Downloading...",
  downloaded: "Downloaded",
  error: "Download failed · Try again",
} as const;

export const PACK_DOWNLOAD_LABEL = {
  downloaded: "Downloaded",
  error: "Download failed · Try again",
  singleDownloading: "Downloading...",
} as const;

/** Multi-file pack downloads — percentage only, never file counts or names. */
export function formatPackDownloadPercent(
  completedItems: number,
  totalItems: number
): string {
  if (totalItems <= 0) {
    return PACK_DOWNLOAD_LABEL.singleDownloading;
  }

  const percent = Math.min(
    100,
    Math.round((completedItems / totalItems) * 100)
  );

  return `Downloading ${percent}%`;
}

export function getPreviewDownloadLabel(
  actionState: string,
  failedAction: "copy" | "download" | null
): string {
  if (actionState === "downloading") {
    return PREVIEW_DOWNLOAD_LABEL.downloading;
  }

  if (actionState === "downloaded") {
    return PREVIEW_DOWNLOAD_LABEL.downloaded;
  }

  if (actionState === "error" && failedAction === "download") {
    return PREVIEW_DOWNLOAD_LABEL.error;
  }

  return PREVIEW_DOWNLOAD_LABEL.idle;
}
