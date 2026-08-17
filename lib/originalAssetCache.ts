/** In-memory cache of original asset blobs — preview URLs are never stored here. */
const blobCache = new Map<string, Promise<Blob>>();

/** Fetches the original uploaded file once and reuses the blob for copy/download. */
export async function fetchOriginalAssetBlob(src: string): Promise<Blob> {
  const cached = blobCache.get(src);
  if (cached) {
    return cached;
  }

  const pending = fetch(src).then(async (response) => {
    if (!response.ok) {
      blobCache.delete(src);
      throw new Error("Failed to fetch original asset.");
    }
    return response.blob();
  });

  blobCache.set(src, pending);
  return pending;
}

/** Warm the cache on hover/focus so copy/download starts faster. */
export function preloadOriginalAsset(src: string): void {
  void fetchOriginalAssetBlob(src).catch(() => {
    blobCache.delete(src);
  });
}
