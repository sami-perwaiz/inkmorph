let lastCopiedAssetId: string | null = null;

export function getLastCopiedAssetId(): string | null {
  return lastCopiedAssetId;
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
  lastCopiedAssetId = assetId;

  if (typeof ClipboardItem !== "undefined") {
    const type = blob.type || "image/png";
    const clipboardItems: Record<string, Blob> = {
      [type]: blob,
    };

    try {
      clipboardItems["text/plain"] = new Blob([assetId], { type: "text/plain" });
      await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
      return;
    } catch {
      await navigator.clipboard.write([
        new ClipboardItem({
          [type]: blob,
        }),
      ]);
      return;
    }
  }

  throw new Error("Clipboard API is not supported.");
}

export async function downloadImage(src: string, filename: string): Promise<void> {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error("Failed to fetch image for download.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export { getDownloadFilename } from "@/lib/inkmorphAssetIds";
