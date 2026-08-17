import type { DownloadSize } from "@/lib/constants";
import type { DownloadProgressOptions } from "@/lib/downloadProgress";
import { fetchOriginalAssetBlob } from "@/lib/originalAssetCache";

const MULTI_DOWNLOAD_STAGGER_MS = 300;
const MIN_PROGRESS_VISIBLE_MS = 350;

function yieldToMain(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

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

/** Starts native downloads sequentially so UI progress can update between files. */
export async function triggerNativeFileDownloads(
  items: ReadonlyArray<{ url: string; filename: string }>,
  options?: NativeFileDownloadOptions
): Promise<void> {
  const totalItems = items.length;

  if (totalItems === 0) {
    return;
  }

  const delayMs = options?.delayMs ?? MULTI_DOWNLOAD_STAGGER_MS;

  options?.onProgress?.(0, totalItems);
  await yieldToMain();
  await new Promise((resolve) =>
    window.setTimeout(resolve, MIN_PROGRESS_VISIBLE_MS)
  );

  for (let index = 0; index < totalItems; index += 1) {
    if (options?.signal?.aborted) {
      throw new DOMException("Download cancelled.", "AbortError");
    }

    if (index > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, delayMs));
    }

    triggerNativeFileDownload(items[index].url, items[index].filename);
    options?.onProgress?.(index + 1, totalItems);
    await yieldToMain();

    if (index + 1 === totalItems) {
      await new Promise((resolve) =>
        window.setTimeout(resolve, MIN_PROGRESS_VISIBLE_MS)
      );
    }
  }
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

export const MIN_SINGLE_DOWNLOAD_UI_MS = 500;

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

  triggerNativeFileDownload(src, filename);
  await yieldToMain();
}
