import { copyFile, mkdir, readdir, rm, stat } from "fs/promises";
import { join } from "path";

import { assignAssetEntries } from "./inkmorph-asset-registry.mjs";

const DEST_ROOT = join(process.cwd(), "public", "illustrations");

const SOURCES = {
  "3d-avatar": "/Users/m1pro/Downloads/3D Images",
  "black-white": "/Users/m1pro/Downloads/Black & White Images",
};

const IMAGE_PATTERN = /\.(png|jpe?g|webp|svg)$/i;

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

  for (const [category, sourceDir] of Object.entries(SOURCES)) {
    counts[category] = await copyToCategory(category, sourceDir);
  }

  console.log(`Ingested ${counts["3d-avatar"]} 3D avatar illustrations.`);
  console.log(`Ingested ${counts["black-white"]} black & white illustrations.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
