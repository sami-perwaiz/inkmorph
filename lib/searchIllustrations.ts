import type { Illustration } from "@/types/illustration";

export interface AssetSearchMetaEntry {
  name: string;
  tags: string[];
}

export interface AssetSearchMetadata {
  version: 1;
  byFilename: Record<string, AssetSearchMetaEntry>;
}

/** Case-insensitive match against name, tags, and filename (metadata only). */
export function illustrationMatchesQuery(
  item: Illustration,
  query: string
): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const haystack = [
    item.name ?? "",
    item.filename,
    ...(item.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  return tokens.every((token) => haystack.includes(token));
}

export function filterIllustrationsBySearch(
  items: Illustration[],
  query: string
): Illustration[] {
  const normalized = query.trim();
  if (!normalized) {
    return items;
  }

  return items.filter((item) => illustrationMatchesQuery(item, normalized));
}
