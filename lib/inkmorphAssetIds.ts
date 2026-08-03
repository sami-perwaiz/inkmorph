import type { IllustrationCategory } from "@/types/illustration";

export const ASSET_PREFIX: Record<IllustrationCategory, string> = {
  "3d-avatar": "IM3D",
  "black-white": "IMBW",
};

/** First five codes per category — fixed premium seed set. */
export const ASSET_CODE_SEEDS: Record<IllustrationCategory, string[]> = {
  "3d-avatar": ["KPX", "QRT", "BLM", "NWF", "ZTA"],
  "black-white": ["XHD", "TPA", "RKE", "LMQ", "VSN"],
};

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export interface AssetRegistryEntry {
  id: string;
  code: string;
  sequence: number;
  category: IllustrationCategory;
  sourceFilename: string;
  destFilename: string;
}

export interface AssetRegistry {
  version: 1;
  entries: AssetRegistryEntry[];
}

export function formatAssetId(
  category: IllustrationCategory,
  code: string,
  sequence: number
): string {
  return `${ASSET_PREFIX[category]}-${code}-${String(sequence).padStart(3, "0")}`;
}

export function generateUniqueCode(
  categoryCount: number,
  used: Set<string>,
  category: IllustrationCategory
): string {
  const seeds = ASSET_CODE_SEEDS[category];

  if (categoryCount < seeds.length) {
    return seeds[categoryCount];
  }

  const target = categoryCount - seeds.length;
  let count = 0;

  for (let i = 0; i < CODE_ALPHABET.length ** 3; i += 1) {
    const a = CODE_ALPHABET[Math.floor(i / 676) % CODE_ALPHABET.length];
    const b = CODE_ALPHABET[Math.floor(i / 26) % CODE_ALPHABET.length];
    const c = CODE_ALPHABET[i % CODE_ALPHABET.length];
    const code = `${a}${b}${c}`;

    if (seeds.includes(code) || used.has(code)) {
      continue;
    }

    if (count === target) {
      return code;
    }

    count += 1;
  }

  throw new Error(`Unable to generate unique asset code for ${category}.`);
}

export function buildRegistryLookup(
  registry: AssetRegistry
): Map<string, AssetRegistryEntry> {
  const lookup = new Map<string, AssetRegistryEntry>();

  for (const entry of registry.entries) {
    lookup.set(`${entry.category}/${entry.destFilename}`, entry);
  }

  return lookup;
}

export function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return ".png";
  }

  return filename.slice(dotIndex).toLowerCase();
}

export function getDownloadFilename(assetId: string, filename: string): string {
  return `${assetId}${getFileExtension(filename)}`;
}
