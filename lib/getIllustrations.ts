import { readFileSync, readdirSync } from "fs";
import { join } from "path";

import {
  buildRegistryLookup,
  type AssetRegistry,
} from "@/lib/inkmorphAssetIds";
import type { AssetSearchMetadata } from "@/lib/searchIllustrations";
import type { Illustration, IllustrationCategory } from "@/types/illustration";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]);

const CATEGORIES: IllustrationCategory[] = ["3d-icon"];

function isImageFile(filename: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext);
}

function loadAssetRegistry(): AssetRegistry {
  const registryPath = join(process.cwd(), "lib", "asset-registry.json");
  const raw = readFileSync(registryPath, "utf8");
  const parsed = JSON.parse(raw) as AssetRegistry;

  if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error("Invalid asset registry format.");
  }

  return parsed;
}

function loadSearchMetadata(): AssetSearchMetadata["byFilename"] {
  try {
    const metaPath = join(process.cwd(), "lib", "asset-search-metadata.json");
    const raw = readFileSync(metaPath, "utf8");
    const parsed = JSON.parse(raw) as AssetSearchMetadata;

    if (parsed.version !== 1 || !parsed.byFilename) {
      return {};
    }

    return parsed.byFilename;
  } catch {
    return {};
  }
}

function toAltText(id: string, name?: string): string {
  return name && name.trim().length > 0 ? name : `3D icon ${id}`;
}

export function getIllustrations(): Illustration[] {
  const publicDir = join(process.cwd(), "public", "illustrations");
  const registry = loadAssetRegistry();
  const lookup = buildRegistryLookup(registry);
  const searchMeta = loadSearchMetadata();
  const illustrations: Illustration[] = [];

  for (const category of CATEGORIES) {
    const categoryDir = join(publicDir, category);

    let files: string[];

    try {
      files = readdirSync(categoryDir).filter(isImageFile);
    } catch {
      continue;
    }

    for (const filename of files.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true })
    )) {
      const entry = lookup.get(`${category}/${filename}`);

      if (!entry) {
        console.warn(
          `Missing InkMorph Asset ID for ${category}/${filename}. Skipping.`
        );
        continue;
      }

      const meta = searchMeta[filename];

      illustrations.push({
        id: entry.id,
        category,
        src: `/illustrations/${category}/${filename}`,
        filename,
        alt: toAltText(entry.id, meta?.name),
        ...(meta?.name ? { name: meta.name } : {}),
        ...(meta?.tags?.length ? { tags: meta.tags } : {}),
      });
    }
  }

  return illustrations;
}
