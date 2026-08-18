/** Shared download button copy — single source for visible button states. */

export const PREVIEW_COPY_LABEL = {
  idle: "Copy Image",
  copied: "Copied",
  error: "Copy failed · Try again",
} as const;

export const PREVIEW_DOWNLOAD_LABEL = {
  idle: "Download",
  downloaded: "Downloaded",
  error: "Download failed · Try again",
} as const;

export const PACK_DOWNLOAD_LABEL = {
  downloaded: "Downloaded",
  error: "Download failed · Try again",
} as const;

/** Pack multi-download progress — percentage only, never file counts or names. */
export function getPackDownloadPercent(
  completedItems: number,
  totalItems: number
): number {
  if (totalItems <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((completedItems / totalItems) * 100));
}

export function getPreviewCopyLabel(
  actionState: string,
  failedAction: "copy" | "download" | null
): string {
  if (actionState === "copied") {
    return PREVIEW_COPY_LABEL.copied;
  }

  if (actionState === "error" && failedAction === "copy") {
    return PREVIEW_COPY_LABEL.error;
  }

  return PREVIEW_COPY_LABEL.idle;
}

export function getPreviewDownloadLabel(
  actionState: string,
  failedAction: "copy" | "download" | null
): string {
  if (actionState === "downloaded") {
    return PREVIEW_DOWNLOAD_LABEL.downloaded;
  }

  if (actionState === "error" && failedAction === "download") {
    return PREVIEW_DOWNLOAD_LABEL.error;
  }

  return PREVIEW_DOWNLOAD_LABEL.idle;
}
