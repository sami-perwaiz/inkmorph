export type DownloadPhase =
  | "preparing"
  | "fetching"
  | "rendering"
  | "zipping"
  | "triggering";

export interface DownloadProgressUpdate {
  phase: DownloadPhase;
  loadedBytes?: number;
  totalBytes?: number | null;
  completedItems?: number;
  totalItems?: number;
}

export interface DownloadProgressOptions {
  onProgress?: (update: DownloadProgressUpdate) => void;
  signal?: AbortSignal;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDownloadProgress(update: DownloadProgressUpdate): string {
  const { phase, loadedBytes, totalBytes, completedItems, totalItems } = update;

  if (
    typeof completedItems === "number" &&
    typeof totalItems === "number" &&
    totalItems > 1
  ) {
    const itemLabel = `Downloading ${completedItems} of ${totalItems}`;

    if (phase === "zipping") {
      return `Creating zip… ${completedItems} of ${totalItems}`;
    }

    if (
      typeof loadedBytes === "number" &&
      loadedBytes > 0 &&
      typeof totalBytes === "number" &&
      totalBytes > 0
    ) {
      const percent = Math.min(
        100,
        Math.round((loadedBytes / totalBytes) * 100)
      );
      return `${itemLabel} · ${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)} · ${percent}%`;
    }

    if (typeof loadedBytes === "number" && loadedBytes > 0) {
      return `${itemLabel} · ${formatBytes(loadedBytes)} downloaded`;
    }

    if (phase === "preparing") {
      return totalItems >= 10
        ? `Preparing ${totalItems} files…`
        : "Preparing download…";
    }

    return itemLabel;
  }

  if (phase === "preparing") {
    return "Preparing…";
  }

  if (phase === "rendering") {
    return "Preparing high-quality PNG…";
  }

  if (phase === "zipping") {
    return "Creating zip…";
  }

  if (phase === "triggering") {
    return "Starting download…";
  }

  if (
    typeof loadedBytes === "number" &&
    loadedBytes > 0 &&
    typeof totalBytes === "number" &&
    totalBytes > 0
  ) {
    const percent = Math.min(
      100,
      Math.round((loadedBytes / totalBytes) * 100)
    );
    return `Downloading… ${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)} · ${percent}%`;
  }

  if (typeof loadedBytes === "number" && loadedBytes > 0) {
    return `Downloading… ${formatBytes(loadedBytes)} downloaded`;
  }

  return "Downloading…";
}

export function reportByteProgress(
  onProgress: DownloadProgressOptions["onProgress"],
  phase: DownloadPhase,
  loaded: number,
  total: number | null
): void {
  onProgress?.({
    phase,
    loadedBytes: loaded,
    totalBytes: total,
  });
}
