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
  query: string,
  options?: { hasPremiumAccess?: boolean }
): Illustration[] {
  const normalized = query.trim();
  if (!normalized) {
    return items;
  }

  const hasPremiumAccess = options?.hasPremiumAccess ?? false;

  return items.filter((item) => {
    if (!hasPremiumAccess && item.premium) {
      return false;
    }

    return illustrationMatchesQuery(item, normalized);
  });
}
