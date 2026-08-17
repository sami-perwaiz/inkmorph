export type DownloadPhase =
  | "preparing"
  | "fetching"
  | "rendering"
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

/** Copy-to-clipboard progress only — not used for download button labels. */
export function formatCopyProgress(update: DownloadProgressUpdate): string {
  const { phase, loadedBytes, totalBytes } = update;

  if (phase === "preparing") {
    return "Preparing…";
  }

  if (phase === "fetching") {
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
      return `Copying… ${formatBytes(loadedBytes)} / ${formatBytes(totalBytes)} · ${percent}%`;
    }

    if (typeof loadedBytes === "number" && loadedBytes > 0) {
      return `Copying… ${formatBytes(loadedBytes)}`;
    }

    return "Copying…";
  }

  return "Copying…";
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
