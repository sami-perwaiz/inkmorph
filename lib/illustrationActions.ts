import type { DownloadSize } from "@/lib/constants";

/**
 * Download quality tiers from the native source (1008×1008):
 * - 1x → 1008×1008 (native PNG)
 * - 2x → 2016×2016 (2×, high-quality resample)
 */
const DOWNLOAD_SCALE: Record<DownloadSize, number> = {
  "1x": 1,
  "2x": 2,
};

export function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Delay revoke so Safari can start the download.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1500);
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Failed to decode image for download."));
    image.src = src;
  });
}

/**
 * Renders the source at the requested download scale.
 * 1x returns the original PNG; 2x upscales to 2016×2016.
 */
export async function renderDownloadPng(
  src: string,
  size: DownloadSize
): Promise<Blob> {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error("Failed to fetch image for download.");
  }

  const sourceBlob = await response.blob();

  if (size === "1x") {
    return sourceBlob;
  }

  const objectUrl = URL.createObjectURL(sourceBlob);

  try {
    const image = await loadImageElement(objectUrl);
    const scale = DOWNLOAD_SCALE[size];
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Unable to prepare download.");
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("Failed to encode PNG.");
    }

    return blob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function copyImageToClipboard(
  src: string,
  assetId: string
): Promise<void> {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error("Failed to fetch image for copying.");
  }

  const blob = await response.blob();

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

export async function downloadImage(
  src: string,
  filename: string,
  size: DownloadSize = "1x"
): Promise<void> {
  const blob = await renderDownloadPng(src, size);
  triggerBrowserDownload(blob, filename);
}
