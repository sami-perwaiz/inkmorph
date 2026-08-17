import JSZip from "jszip";

import { getCanonicalFilename } from "@/lib/canonicalAsset";
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

function sanitizeFolderName(name: string): string {
  return name.replace(/[^\w.-]+/g, "-").replace(/^-+|-+$/g, "") || "icons";
}

function iconFilename(item: Illustration): string {
  return getCanonicalFilename(item);
}

async function addIconsToSession(
  pack: IconPack,
  items: Illustration[]
): Promise<void> {
  let bucket = session.get(pack.id);
  if (!bucket) {
    bucket = { packId: pack.id, icons: new Map() };
    session.set(pack.id, bucket);
  }

  const results = await Promise.all(
    items.map(async (item) => {
      const blob = await renderDownloadPng(item.src, "1x");
      return {
        id: item.id,
        filename: iconFilename(item),
        blob,
      };
    })
  );

  for (const stored of results) {
    bucket.icons.set(stored.id, {
      filename: stored.filename,
      blob: stored.blob,
    });
  }
}

async function downloadPackZip(
  pack: IconPack,
  items: Illustration[]
): Promise<void> {
  const bucket = session.get(pack.id);
  if (!bucket) {
    throw new Error("Failed to prepare pack download.");
  }

  const folderName = sanitizeFolderName(pack.id);
  const zip = new JSZip();
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

  const blob = await zip.generateAsync({ type: "blob" });
  triggerBrowserDownload(blob, `${folderName}.zip`);
}

async function downloadSessionZip(): Promise<void> {
  const zip = new JSZip();
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

  const blob = await zip.generateAsync({ type: "blob" });
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
  items: Illustration[]
): Promise<void> {
  if (items.length === 0) {
    throw new Error("No icons selected for download.");
  }

  await addIconsToSession(pack, items);

  if (session.size >= 2) {
    await downloadSessionZip();
    return;
  }

  if (items.length > 1) {
    await downloadPackZip(pack, items);
    return;
  }

  const bucket = session.get(pack.id);
  const stored = bucket?.icons.get(items[0].id);
  if (!stored) {
    throw new Error("Failed to prepare icon for download.");
  }

  triggerBrowserDownload(stored.blob, stored.filename);
}
