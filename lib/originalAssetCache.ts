import { reportByteProgress } from "@/lib/downloadProgress";
import type { DownloadProgressOptions } from "@/lib/downloadProgress";

/** In-memory cache of original asset blobs — preview URLs are never stored here. */
const blobCache = new Map<string, Promise<Blob>>();
const MAX_BLOB_CACHE_ENTRIES = 24;

function trimBlobCache(): void {
  while (blobCache.size > MAX_BLOB_CACHE_ENTRIES) {
    const oldestKey = blobCache.keys().next().value;
    if (!oldestKey) {
      break;
    }
    blobCache.delete(oldestKey);
  }
}

async function readResponseWithProgress(
  response: Response,
  onProgress?: (loaded: number, total: number | null) => void
): Promise<Blob> {
  const contentLength = response.headers.get("content-length");
  const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : null;
  const contentType = response.headers.get("content-type") || "image/png";

  if (!response.body) {
    const blob = await response.blob();
    onProgress?.(blob.size, blob.size);
    return blob;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    if (!value) {
      continue;
    }

    chunks.push(value);
    loaded += value.length;
    onProgress?.(loaded, totalBytes);
  }

  const blob = new Blob(chunks as BlobPart[], { type: contentType });
  onProgress?.(blob.size, blob.size);
  return blob;
}

/** Fetches the original uploaded file once and reuses the blob for copy/download. */
export async function fetchOriginalAssetBlob(
  src: string,
  options?: DownloadProgressOptions
): Promise<Blob> {
  const cached = blobCache.get(src);
  if (cached) {
    const blob = await cached;
    reportByteProgress(options?.onProgress, "fetching", blob.size, blob.size);
    return blob;
  }

  const pending = (async (): Promise<Blob> => {
    const response = await fetch(src, { signal: options?.signal });

    if (!response.ok) {
      blobCache.delete(src);
      throw new Error("Failed to fetch original asset.");
    }

    return readResponseWithProgress(response, (loaded, total) => {
      reportByteProgress(options?.onProgress, "fetching", loaded, total);
    });
  })();

  blobCache.set(src, pending);
  trimBlobCache();

  try {
    return await pending;
  } catch (error) {
    blobCache.delete(src);
    throw error;
  }
}

/** Warm the cache on hover/focus so copy/download starts faster. */
export function preloadOriginalAsset(src: string): void {
  void fetchOriginalAssetBlob(src).catch(() => {
    blobCache.delete(src);
  });
}
