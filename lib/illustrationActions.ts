function triggerBrowserDownload(blob: Blob, filename: string): void {
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
  filename: string
): Promise<void> {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error("Failed to fetch image for download.");
  }

  const blob = await response.blob();
  triggerBrowserDownload(blob, filename);
}
