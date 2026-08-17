import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const ROOT = process.cwd();
const REGISTRY_PATH = join(ROOT, "lib", "asset-registry.json");
const OUTPUT_PATH = join(ROOT, "lib", "asset-url-map.json");

const PRO_ICON_PACK_CONFIGS = {
  "fuzzy-3d-icon-1": { downloadPrefix: "im-fz3d" },
  "fuzzy-3d-icon-2": { downloadPrefix: "im-gl3d" },
  "fuzzy-3d-icon-3": { downloadPrefix: "im-lq3d" },
  "fuzzy-3d-icon-4": { downloadPrefix: "im-ng3d" },
};

function getDownloadFilename(assetId, filename) {
  const dotIndex = filename.lastIndexOf(".");
  const ext = dotIndex === -1 ? ".png" : filename.slice(dotIndex).toLowerCase();
  return `${assetId}${ext}`;
}

function loadRegistry() {
  const raw = readFileSync(REGISTRY_PATH, "utf8");
  const parsed = JSON.parse(raw);

  if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
    throw new Error("Invalid asset registry format.");
  }

  return parsed.entries;
}

function addRoute(routes, canonicalFilename, storagePath) {
  if (routes[canonicalFilename] && routes[canonicalFilename] !== storagePath) {
    throw new Error(
      `Canonical filename collision for ${canonicalFilename}: ${routes[canonicalFilename]} vs ${storagePath}`
    );
  }

  routes[canonicalFilename] = storagePath;
}

function buildGalleryRoutes(routes) {
  for (const entry of loadRegistry()) {
    const storagePath = `/illustrations/${entry.category}/${entry.destFilename}`;
    const canonicalFilename = getDownloadFilename(entry.id, entry.destFilename);
    addRoute(routes, canonicalFilename, storagePath);
  }
}

function buildStitchedLeatherRoutes(routes) {
  for (let index = 0; index < 100; index += 1) {
    const number = String(index + 1).padStart(2, "0");
    const downloadId = String(index + 1).padStart(3, "0");
    const canonicalFilename = `im-sl3d-${downloadId}.png`;
    const storagePath = `/packs/stitched-leather-3d/icons/${number}.png`;
    addRoute(routes, canonicalFilename, storagePath);
  }
}

function buildProPackRoutes(routes) {
  for (const [packId, config] of Object.entries(PRO_ICON_PACK_CONFIGS)) {
    for (let index = 0; index < 100; index += 1) {
      const number = String(index + 1).padStart(2, "0");
      const downloadId = String(index + 1).padStart(3, "0");
      const canonicalFilename = `${config.downloadPrefix}-${downloadId}.png`;
      const storagePath = `/packs/${packId}/icons/${number}.png`;
      addRoute(routes, canonicalFilename, storagePath);
    }
  }
}

function main() {
  const routes = {};

  buildGalleryRoutes(routes);
  buildStitchedLeatherRoutes(routes);
  buildProPackRoutes(routes);

  const output = {
    version: 1,
    routes,
  };

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(
    `Generated ${Object.keys(routes).length} canonical asset routes → lib/asset-url-map.json`
  );
}

main();
