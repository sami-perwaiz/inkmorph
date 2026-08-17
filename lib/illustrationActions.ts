import type { DownloadSize } from "@/lib/constants";
import type { DownloadProgressOptions } from "@/lib/downloadProgress";
import { fetchOriginalAssetBlob } from "@/lib/originalAssetCache";

const MULTI_DOWNLOAD_STAGGER_MS = 300;

/** Same-origin direct download — Chrome handles fetch/progress in its Downloads UI. */
export function triggerNativeFileDownload(url: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

interface NativeFileDownloadOptions {
  delayMs?: number;
  signal?: AbortSignal;
  onProgress?: (completedItems: number, totalItems: number) => void;
}

/** Schedules native downloads and resolves once every file has been started. */
export function triggerNativeFileDownloads(
  items: ReadonlyArray<{ url: string; filename: string }>,
  options?: NativeFileDownloadOptions
): Promise<void> {
  if (items.length === 0) {
    return Promise.resolve();
  }

  if (items.length === 1) {
    triggerNativeFileDownload(items[0].url, items[0].filename);
    options?.onProgress?.(1, 1);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const delayMs = options?.delayMs ?? MULTI_DOWNLOAD_STAGGER_MS;
    const totalItems = items.length;
    let completedItems = 0;
    let settled = false;
    const timeoutIds: number[] = [];

    const settleResolve = () => {
      if (settled) {
        return;
      }

      settled = true;
      resolve();
    };

    const settleReject = (error: DOMException) => {
      if (settled) {
        return;
      }

      settled = true;
      reject(error);
    };

    const clearPending = () => {
      for (const id of timeoutIds) {
        window.clearTimeout(id);
      }
      timeoutIds.length = 0;
    };

    options?.signal?.addEventListener(
      "abort",
      () => {
        clearPending();
        settleReject(new DOMException("Download cancelled.", "AbortError"));
      },
      { once: true }
    );

    items.forEach((item, index) => {
      const timeoutId = window.setTimeout(() => {
        if (options?.signal?.aborted) {
          return;
        }

        triggerNativeFileDownload(item.url, item.filename);
        completedItems += 1;
        options?.onProgress?.(completedItems, totalItems);

        if (completedItems === totalItems) {
          settleResolve();
        }
      }, index * delayMs);

      timeoutIds.push(timeoutId);
    });
  });
}

export async function copyImageToClipboard(
  src: string,
  assetId: string,
  options?: DownloadProgressOptions
): Promise<void> {
  options?.onProgress?.({ phase: "preparing" });

  const blob = await fetchOriginalAssetBlob(src, options);

  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Clipboard API is not supported.");
  }

  const type = blob.type || "image/png";

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [type]: blob,
        "text/plain": new Blob([assetId], { type: "text/plain" }),
      }),
    ]);
    return;
  } catch {
    await navigator.clipboard.write([
      new ClipboardItem({
        [type]: blob,
      }),
    ]);
  }
}

/** Starts a native browser download from the original asset URL (1x and 2x). */
export async function downloadImage(
  src: string,
  filename: string,
  size: DownloadSize = "1x",
  options?: DownloadProgressOptions
): Promise<void> {
  void size;

  if (options?.signal?.aborted) {
    throw new DOMException("Download cancelled.", "AbortError");
  }

  options?.onProgress?.({ phase: "triggering" });
  triggerNativeFileDownload(src, filename);

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}
