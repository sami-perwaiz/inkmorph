import { getDownloadFilename } from "@/lib/inkmorphAssetIds";
import type { Illustration } from "@/types/illustration";

/** Public URL prefix for canonical asset filenames (rewritten to storage paths). */
export const CANONICAL_ASSET_PREFIX = "/assets";

/** On-disk filename used for category/search heuristics. */
export function getStorageFilename(
  illustration: Pick<Illustration, "filename" | "storageFilename">
): string {
  return illustration.storageFilename ?? illustration.filename ?? "";
}
export function getCanonicalFilename(
  illustration: Pick<Illustration, "id" | "filename">
): string {
  if (illustration.filename?.trim()) {
    return illustration.filename.trim();
  }

  return getDownloadFilename(illustration.id, ".png");
}

/** Public URL that resolves to the original file under its canonical filename. */
export function getCanonicalAssetUrl(
  illustration: Pick<Illustration, "id" | "filename">
): string {
  return `${CANONICAL_ASSET_PREFIX}/${getCanonicalFilename(illustration)}`;
}
