import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const REGISTRY_PATH = join(process.cwd(), "lib", "asset-registry.json");

const ASSET_PREFIX = {
  "3d-avatar": "IM3D",
  "black-white": "IMBW",
};

const ASSET_CODE_SEEDS = {
  "3d-avatar": ["KPX", "QRT", "BLM", "NWF", "ZTA"],
  "black-white": ["XHD", "TPA", "RKE", "LMQ", "VSN"],
};

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function slugify(filename) {
  return filename
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

function formatAssetId(category, code, sequence) {
  return `${ASSET_PREFIX[category]}-${code}-${String(sequence).padStart(3, "0")}`;
}

function generateUniqueCode(categoryCount, used, category) {
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

function loadRegistry() {
  try {
    const raw = readFileSync(REGISTRY_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (parsed?.version === 1 && Array.isArray(parsed.entries)) {
      return parsed;
    }
  } catch {
    // Fresh registry.
  }

  return { version: 1, entries: [] };
}

function saveRegistry(registry) {
  writeFileSync(REGISTRY_PATH, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

function getUsedCodes(entries, category) {
  const used = new Set();

  for (const entry of entries) {
    if (entry.category === category) {
      used.add(entry.code);
    }
  }

  return used;
}

function getNextSequence(entries, category) {
  const sequences = entries
    .filter((entry) => entry.category === category)
    .map((entry) => entry.sequence);

  if (sequences.length === 0) {
    return 1;
  }

  return Math.max(...sequences) + 1;
}

function getNextDestNumber(entries, category) {
  const numbers = entries
    .filter((entry) => entry.category === category)
    .map((entry) => {
      const match = entry.destFilename.match(/^(\d+)-/);
      return match ? Number.parseInt(match[1], 10) : 0;
    });

  if (numbers.length === 0) {
    return 1;
  }

  return Math.max(...numbers) + 1;
}

/** Assigns or preserves InkMorph Asset IDs for ingested source files. */
export function assignAssetEntries(category, sourceFilenames) {
  const registry = loadRegistry();
  const assigned = [];
  let entries = registry.entries.filter((entry) => entry.category !== category);
  const categoryEntries = registry.entries.filter(
    (entry) => entry.category === category
  );

  for (const sourceFilename of sourceFilenames) {
    const existing = categoryEntries.find(
      (entry) => entry.sourceFilename === sourceFilename
    );

    if (existing) {
      assigned.push(existing);
      entries.push(existing);
      continue;
    }

    const usedCodes = getUsedCodes(entries, category);
    const categoryCount = entries.filter(
      (entry) => entry.category === category
    ).length;
    const sequence = getNextSequence(entries, category);
    const destNumber = getNextDestNumber(entries, category);
    const code = generateUniqueCode(categoryCount, usedCodes, category);

    const entry = {
      id: formatAssetId(category, code, sequence),
      code,
      sequence,
      category,
      sourceFilename,
      destFilename: `${String(destNumber).padStart(3, "0")}-${slugify(sourceFilename)}`,
    };

    entries.push(entry);
    assigned.push(entry);
  }

  registry.entries = entries;
  saveRegistry(registry);

  return assigned;
}

export { loadRegistry, REGISTRY_PATH };
