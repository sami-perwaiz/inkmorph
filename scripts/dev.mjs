import { spawn, spawnSync } from "node:child_process";
import { existsSync, rmSync, watch } from "node:fs";
import { join } from "node:path";

import { stopDevServers } from "./stop-dev.mjs";

const nextDir = ".next";
const productionBuildMarker = join(nextDir, "BUILD_ID");
const devStaticDir = join(nextDir, "static", "development");

function hasIncompatibleCache() {
  return (
    existsSync(productionBuildMarker) ||
    (existsSync(nextDir) && !existsSync(devStaticDir))
  );
}

function clearNextCache(reason) {
  if (!existsSync(nextDir)) {
    return;
  }

  rmSync(nextDir, { recursive: true, force: true });
  console.log(reason);
}

let child = null;
let cacheWatcher = null;
let restarting = false;
let intentionalExit = false;

function startNextDev() {
  child = spawn("npx", ["next", "dev", "--turbopack"], {
    stdio: "inherit",
  });

  child.on("exit", (code, signal) => {
    if (cacheWatcher) {
      cacheWatcher.close();
      cacheWatcher = null;
    }

    if (restarting) {
      restarting = false;
      clearNextCache("Cleared .next cache before restarting dev.");
      startDevSession();
      return;
    }

    if (intentionalExit) {
      process.exit(code ?? 0);
      return;
    }

    process.exit(code ?? (signal ? 1 : 0));
  });
}

function requestRestart(reason) {
  if (restarting || !child) {
    return;
  }

  restarting = true;
  console.log(`\n${reason}\n`);
  child.kill("SIGTERM");
}

function watchForProductionBuild() {
  if (!existsSync(nextDir)) {
    setTimeout(watchForProductionBuild, 500);
    return;
  }

  cacheWatcher = watch(nextDir, (event, filename) => {
    if (filename !== "BUILD_ID" || event !== "rename") {
      return;
    }

    if (!existsSync(productionBuildMarker)) {
      return;
    }

    requestRestart(
      "Production build detected while dev was running — restarting with a clean cache."
    );
  });
}

function startDevSession() {
  stopDevServers();

  if (hasIncompatibleCache()) {
    clearNextCache("Removed incompatible .next cache before starting dev.");
  }

  spawnSync("node", ["scripts/ingest-illustrations.mjs"], { stdio: "inherit" });
  startNextDev();
  watchForProductionBuild();
}

process.on("SIGINT", () => {
  intentionalExit = true;
  child?.kill("SIGINT");
});

process.on("SIGTERM", () => {
  intentionalExit = true;
  child?.kill("SIGTERM");
});

startDevSession();
