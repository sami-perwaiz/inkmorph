import { constants } from "fs";
import { access, mkdir, readdir, stat } from "fs/promises";
import { basename, dirname, join } from "path";

import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");

/** Figma pack/wallpaper card — 654×400 tile; 2× for retina. */
const CARD_THUMB_WIDTH = 1308;
const CARD_THUMB_QUALITY = 84;

const CARD_THUMB_SOURCES = [
  {
    label: "pack",
    sourceDir: join(PUBLIC_DIR, "packs"),
    destDir: join(PUBLIC_DIR, "packs", "thumbs"),
  },
  {
    label: "wallpaper",
    sourceDir: join(PUBLIC_DIR, "wallpapers"),
    destDir: join(PUBLIC_DIR, "wallpapers", "thumbs"),
    exclude: (name) => name.includes("-preview"),
  },
];

async function pathExists(targetPath) {
  try {
    await access(targetPath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function shouldSkip(sourcePath, destPath) {
  try {
    const destStat = await stat(destPath);
    const sourceStat = await stat(sourcePath);
    return destStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}

async function listPngFiles(dir, exclude = () => false) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        entry.name.toLowerCase().endsWith(".png") &&
        !exclude(entry.name)
    )
    .map((entry) => join(dir, entry.name));
}

async function writeCardThumbnail(sourcePath, destPath) {
  await mkdir(dirname(destPath), { recursive: true });

  if (await shouldSkip(sourcePath, destPath)) {
    return false;
  }

  await sharp(sourcePath)
    .rotate()
    .resize({
      width: CARD_THUMB_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: CARD_THUMB_QUALITY, effort: 4 })
    .toFile(destPath);

  return true;
}

async function generateGroup({ label, sourceDir, destDir, exclude }) {
  if (!(await pathExists(sourceDir))) {
    console.warn(`Skipping missing ${label} source dir: ${sourceDir}`);
    return { created: 0, skipped: 0, missing: 0 };
  }

  let created = 0;
  let skipped = 0;
  const sources = await listPngFiles(sourceDir, exclude ?? (() => false));

  for (const sourcePath of sources) {
    const destPath = join(
      destDir,
      `${basename(sourcePath, ".png")}.webp`
    );
    const wrote = await writeCardThumbnail(sourcePath, destPath);

    if (wrote) {
      created += 1;
    } else {
      skipped += 1;
    }
  }

  return { created, skipped, missing: 0 };
}

async function main() {
  let created = 0;
  let skipped = 0;

  for (const group of CARD_THUMB_SOURCES) {
    const result = await generateGroup(group);
    created += result.created;
    skipped += result.skipped;
  }

  console.log(
    `Card thumbnails: wrote ${created}, skipped ${skipped} (up to date).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
