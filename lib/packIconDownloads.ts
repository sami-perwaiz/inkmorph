import { getCanonicalFilename } from "@/lib/canonicalAsset";
import type { DownloadProgressOptions } from "@/lib/downloadProgress";
import {
  renderDownloadPng,
  triggerBrowserDownload,
} from "@/lib/illustrationActions";
import type { IconPack } from "@/lib/iconPacks";
import type { Illustration } from "@/types/illustration";

const MULTI_PACK_ZIP_ROOT = "InkMorph Icon Packs";
const MULTI_PACK_ZIP_FILENAME = "InkMorph Icon Packs.zip";

interface StoredIcon {
  filename: string;
  blob: Blob;
}

interface PackBucket {
  packId: string;
  icons: Map<string, StoredIcon>;
}

const session = new Map<string, PackBucket>();

async function createZip() {
  const { default: JSZip } = await import("jszip");
  return new JSZip();
}

function sanitizeFolderName(name: string): string {
  return name.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "icons";
}

function iconFilename(item: Illustration): string {
  return getCanonicalFilename(item);
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException("Download cancelled.", "AbortError");
  }
}

async function addIconsToSession(
  pack: IconPack,
  items: Illustration[],
  options?: DownloadProgressOptions
): Promise<void> {
  let bucket = session.get(pack.id);
  if (!bucket) {
    bucket = { packId: pack.id, icons: new Map() };
    session.set(pack.id, bucket);
  }

  const totalItems = items.length;

  options?.onProgress?.({
    phase: "preparing",
    completedItems: 0,
    totalItems,
  });

  for (let index = 0; index < items.length; index += 1) {
    throwIfAborted(options?.signal);

    const item = items[index];

    options?.onProgress?.({
      phase: "fetching",
      completedItems: index,
      totalItems,
    });

    const blob = await renderDownloadPng(item.src, "1x", {
      signal: options?.signal,
      onProgress: (update) => {
        options?.onProgress?.({
          ...update,
          completedItems: index,
          totalItems,
        });
      },
    });

    bucket.icons.set(item.id, {
      filename: iconFilename(item),
      blob,
    });

    options?.onProgress?.({
      phase: "fetching",
      completedItems: index + 1,
      totalItems,
    });
  }
}

async function downloadPackZip(
  pack: IconPack,
  items: Illustration[],
  options?: DownloadProgressOptions
): Promise<void> {
  const bucket = session.get(pack.id);
  if (!bucket) {
    throw new Error("Failed to prepare pack download.");
  }

  throwIfAborted(options?.signal);

  const folderName = sanitizeFolderName(pack.id);
  const zip = await createZip();
  const folder = zip.folder(folderName);
  if (!folder) {
    throw new Error("Failed to create zip folder.");
  }

  for (const item of items) {
    const stored = bucket.icons.get(item.id);
    if (stored) {
      folder.file(stored.filename, stored.blob);
    }
  }

  options?.onProgress?.({
    phase: "zipping",
    completedItems: items.length,
    totalItems: items.length,
  });

  const blob = await zip.generateAsync(
    { type: "blob" },
    (metadata) => {
      options?.onProgress?.({
        phase: "zipping",
        completedItems: items.length,
        totalItems: items.length,
        loadedBytes: metadata.percent,
        totalBytes: 100,
      });
    }
  );

  options?.onProgress?.({ phase: "triggering" });
  triggerBrowserDownload(blob, `${folderName}.zip`);
}

async function downloadSessionZip(
  options?: DownloadProgressOptions
): Promise<void> {
  throwIfAborted(options?.signal);

  const zip = await createZip();
  const root = zip.folder(MULTI_PACK_ZIP_ROOT);
  if (!root) {
    throw new Error("Failed to create zip folder.");
  }

  for (const bucket of session.values()) {
    const folder = root.folder(sanitizeFolderName(bucket.packId));
    if (!folder) {
      continue;
    }

    for (const icon of bucket.icons.values()) {
      folder.file(icon.filename, icon.blob);
    }
  }

  options?.onProgress?.({ phase: "zipping" });

  const blob = await zip.generateAsync(
    { type: "blob" },
    (metadata) => {
      options?.onProgress?.({
        phase: "zipping",
        loadedBytes: metadata.percent,
        totalBytes: 100,
      });
    }
  );

  options?.onProgress?.({ phase: "triggering" });
  triggerBrowserDownload(blob, MULTI_PACK_ZIP_FILENAME);
  session.clear();
}

/**
 * Downloads icons from a pack. Multiple icons are bundled into a single
 * folder zip. When the session spans more than one pack, every accumulated
 * icon is included in one combined zip.
 */
export async function downloadPackIcons(
  pack: IconPack,
  items: Illustration[],
  options?: DownloadProgressOptions
): Promise<void> {
  if (items.length === 0) {
    throw new Error("No icons selected for download.");
  }

  await addIconsToSession(pack, items, options);

  if (session.size >= 2) {
    await downloadSessionZip(options);
    return;
  }

  if (items.length > 1) {
    await downloadPackZip(pack, items, options);
    return;
  }

  const bucket = session.get(pack.id);
  const stored = bucket?.icons.get(items[0].id);
  if (!stored) {
    throw new Error("Failed to prepare icon for download.");
  }

  options?.onProgress?.({ phase: "triggering" });
  triggerBrowserDownload(stored.blob, stored.filename);
}
