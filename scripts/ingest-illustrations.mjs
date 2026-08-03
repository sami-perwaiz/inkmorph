import { access, copyFile, mkdir, readdir, rm, stat } from "fs/promises";
import { join } from "path";

import { assignAssetEntries } from "./inkmorph-asset-registry.mjs";

const DEST_ROOT = join(process.cwd(), "public", "illustrations");

/** Project-relative source folders. Override with env vars when needed. */
const SOURCES = {
  "3d-avatar":
    process.env.INKMORPH_SOURCE_3D_AVATAR ??
    join(process.cwd(), "source-images", "3d-avatar"),
  "black-white":
    process.env.INKMORPH_SOURCE_BLACK_WHITE ??
    join(process.cwd(), "source-images", "black-white"),
};

const IMAGE_PATTERN = /\.(png|jpe?g|webp|svg)$/i;

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function listImageFiles(sourceDir) {
  const entries = await readdir(sourceDir);

  const files = await Promise.all(
    entries.map(async (file) => {
      const fullPath = join(sourceDir, file);
      const info = await stat(fullPath);
      return info.isFile() && IMAGE_PATTERN.test(file) ? file : null;
    })
  );

  return files
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

async function copyToCategory(category, sourceDir) {
  const files = await listImageFiles(sourceDir);
  const destDir = join(DEST_ROOT, category);
  const assetEntries = assignAssetEntries(category, files);

  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });

  for (const [index, sourceFilename] of files.entries()) {
    const entry = assetEntries[index];
    await copyFile(
      join(sourceDir, sourceFilename),
      join(destDir, entry.destFilename)
    );
  }

  return files.length;
}

async function main() {
  const counts = {};
  let ingestedAny = false;

  for (const [category, sourceDir] of Object.entries(SOURCES)) {
    if (!(await pathExists(sourceDir))) {
      console.warn(
        `Skipping "${category}" ingestion: source folder not found at ${sourceDir}`
      );
      counts[category] = 0;
      continue;
    }

    const info = await stat(sourceDir);
    if (!info.isDirectory()) {
      console.warn(
        `Skipping "${category}" ingestion: path is not a directory (${sourceDir})`
      );
      counts[category] = 0;
      continue;
    }

    counts[category] = await copyToCategory(category, sourceDir);
    ingestedAny = true;
    console.log(
      `Ingested ${counts[category]} ${category} illustrations from ${sourceDir}.`
    );
  }

  if (!ingestedAny) {
    console.warn(
      "No source image folders found. Skipping ingestion and keeping existing public/illustrations assets."
    );
    return;
  }

  console.log(`Ingested ${counts["3d-avatar"]} 3D avatar illustrations.`);
  console.log(`Ingested ${counts["black-white"]} black & white illustrations.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
