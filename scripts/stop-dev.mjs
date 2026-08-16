import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/** Stop local Next.js dev servers so production builds cannot corrupt a live .next cache. */
export function stopDevServers() {
  const ports = [3000, 3001, 3002];

  for (const port of ports) {
    const lookup = spawnSync("lsof", ["-ti", `:${port}`], {
      encoding: "utf8",
    });

    if (lookup.status !== 0 || !lookup.stdout?.trim()) {
      continue;
    }

    for (const pid of lookup.stdout.trim().split("\n")) {
      const numericPid = Number(pid);
      if (!Number.isFinite(numericPid)) {
        continue;
      }

      try {
        process.kill(numericPid, "SIGTERM");
      } catch {
        // Process may already be gone.
      }
    }
  }

  spawnSync("pkill", ["-f", "next dev"], { stdio: "ignore" });
  spawnSync("pkill", ["-f", "node scripts/dev.mjs"], { stdio: "ignore" });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  stopDevServers();
}
