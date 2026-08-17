import { getCanonicalFilename } from "@/lib/canonicalAsset";
import type { DownloadProgressOptions } from "@/lib/downloadProgress";
import { triggerNativeFileDownloads } from "@/lib/illustrationActions";
import type { IconPack } from "@/lib/iconPacks";
import type { Illustration } from "@/types/illustration";

/**
 * Starts native browser downloads for pack icons.
 * Permission/limit checks must complete before calling this.
 */
export async function downloadPackIcons(
  _pack: IconPack,
  items: Illustration[],
  options?: DownloadProgressOptions
): Promise<void> {
  if (items.length === 0) {
    throw new Error("No icons selected for download.");
  }

  if (options?.signal?.aborted) {
    throw new DOMException("Download cancelled.", "AbortError");
  }

  const totalItems = items.length;

  options?.onProgress?.({
    phase: "triggering",
    completedItems: 0,
    totalItems,
  });

  await triggerNativeFileDownloads(
    items.map((item) => ({
      url: item.src,
      filename: getCanonicalFilename(item),
    })),
    {
      signal: options?.signal,
      onProgress: (completedItems, itemCount) => {
        options?.onProgress?.({
          phase: "triggering",
          completedItems,
          totalItems: itemCount,
        });
      },
    }
  );
}
