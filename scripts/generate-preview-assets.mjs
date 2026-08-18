import { constants, writeFileSync } from "fs";
import { access, mkdir, stat } from "fs/promises";
import { dirname, join } from "path";

import sharp from "sharp";

import assetUrlMap from "../lib/asset-url-map.json" with { type: "json" };

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");
const PREVIEWS_DIR = join(PUBLIC_DIR, "previews");
const WALLPAPER_PREVIEWS_DIR = join(PUBLIC_DIR, "wallpapers", "previews");

/** 2× max CSS display sizes from lib/imageDelivery.ts */
const VARIANTS = {
  sm: 384,
  lg: 960,
};

const WALLPAPER_DOWNLOADS = [
  "crimson-geometry",
  "chrome-noir",
  "obsidian-orbit",
  "pastel-horizon",
  "neon-pebbles",
  "liquid-chrome",
  "monochrome-motion",
  "dreamscape-profile",
  "mountain-solitude",
  "azure-curves",
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

async function writePreview(sourcePath, destPath, width) {
  await mkdir(dirname(destPath), { recursive: true });

  if (await shouldSkip(sourcePath, destPath)) {
    return false;
  }

  await sharp(sourcePath)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({ quality: 82, effort: 4 })
    .toFile(destPath);

  return true;
}

async function generateCanonicalPreviews() {
  let created = 0;
  let skipped = 0;

  for (const [canonicalFilename, storagePath] of Object.entries(
    assetUrlMap.routes
  )) {
    const sourcePath = join(PUBLIC_DIR, storagePath.replace(/^\//, ""));

    if (!(await pathExists(sourcePath))) {
      console.warn(`Skipping missing preview source: ${sourcePath}`);
      continue;
    }

    const basename = canonicalFilename.replace(/\.[^.]+$/i, "");

    for (const [variant, width] of Object.entries(VARIANTS)) {
      const destPath = join(PREVIEWS_DIR, `${basename}-${variant}.webp`);
      const wrote = await writePreview(sourcePath, destPath, width);

      if (wrote) {
        created += 1;
      } else {
        skipped += 1;
      }
    }
  }

  return { created, skipped };
}

async function generateWallpaperPreviews() {
  let created = 0;
  let skipped = 0;

  for (const wallpaperId of WALLPAPER_DOWNLOADS) {
    const sourcePath = join(
      PUBLIC_DIR,
      "wallpapers",
      "downloads",
      `${wallpaperId}.png`
    );

    if (!(await pathExists(sourcePath))) {
      console.warn(`Skipping missing wallpaper source: ${sourcePath}`);
      continue;
    }

    for (const [variant, width] of Object.entries(VARIANTS)) {
      const destPath = join(
        WALLPAPER_PREVIEWS_DIR,
        `${wallpaperId}-${variant}.webp`
      );
      const wrote = await writePreview(sourcePath, destPath, width);

      if (wrote) {
        created += 1;
      } else {
        skipped += 1;
      }
    }
  }

  return { created, skipped };
}

async function main() {
  await mkdir(PREVIEWS_DIR, { recursive: true });
  await mkdir(WALLPAPER_PREVIEWS_DIR, { recursive: true });

  const gallery = await generateCanonicalPreviews();
  const wallpapers = await generateWallpaperPreviews();

  const manifest = {
    version: 1,
    generatedAt: new Date().toISOString(),
    variants: VARIANTS,
    gallery,
    wallpapers,
  };

  writeFileSync(
    join(ROOT, "lib", "preview-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );

  console.log(
    `Preview assets: wrote ${gallery.created + wallpapers.created}, skipped ${gallery.skipped + wallpapers.skipped} (up to date).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
