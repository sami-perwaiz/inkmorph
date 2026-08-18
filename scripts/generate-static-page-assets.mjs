import { constants } from "fs";
import { access, mkdir, stat } from "fs/promises";
import { dirname, join } from "path";

import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC_DIR = join(ROOT, "public");

/** Marketing / empty-state PNGs → responsive WebP (sources stay in public/). */
const STATIC_PAGE_ASSETS = [
  {
    source: join(PUBLIC_DIR, "pricing", "hero-bg-v3.png"),
    outputs: [
      {
        dest: join(PUBLIC_DIR, "pricing", "hero-bg-v3.webp"),
        width: 1920,
        quality: 80,
      },
      {
        dest: join(PUBLIC_DIR, "pricing", "hero-bg-v3-sm.webp"),
        width: 960,
        quality: 78,
      },
    ],
  },
  {
    source: join(PUBLIC_DIR, "search", "no-results.png"),
    outputs: [
      {
        dest: join(PUBLIC_DIR, "search", "no-results.webp"),
        width: 960,
        quality: 80,
      },
    ],
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

async function writeWebp(sourcePath, { dest, width, quality }) {
  await mkdir(dirname(dest), { recursive: true });

  if (await shouldSkip(sourcePath, dest)) {
    return false;
  }

  await sharp(sourcePath)
    .rotate()
    .resize({
      width,
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toFile(dest);

  return true;
}

async function main() {
  let created = 0;
  let skipped = 0;
  let missing = 0;

  for (const asset of STATIC_PAGE_ASSETS) {
    if (!(await pathExists(asset.source))) {
      console.warn(`Skipping missing static page source: ${asset.source}`);
      missing += 1;
      continue;
    }

    for (const output of asset.outputs) {
      const wrote = await writeWebp(asset.source, output);

      if (wrote) {
        created += 1;
      } else {
        skipped += 1;
      }
    }
  }

  console.log(
    `Static page assets: wrote ${created}, skipped ${skipped}${missing ? `, missing sources ${missing}` : ""} (up to date).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
