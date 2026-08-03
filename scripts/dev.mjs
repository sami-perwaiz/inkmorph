import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const nextDir = ".next";
const productionBuildMarker = join(nextDir, "BUILD_ID");
const devStaticDir = join(nextDir, "static", "development");

// Production output and partial caches break the Turbopack dev server.
const hasIncompatibleCache =
  existsSync(productionBuildMarker) ||
  (existsSync(nextDir) && !existsSync(devStaticDir));

if (hasIncompatibleCache) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("Removed incompatible .next cache before starting dev.");
}

spawnSync("node", ["scripts/ingest-illustrations.mjs"], { stdio: "inherit" });

const child = spawn("npx", ["next", "dev", "--turbopack"], {
  stdio: "inherit",
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
