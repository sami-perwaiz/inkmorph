/** Figma 40004571:9074 — Daily Download Limit Reached */
export const DAILY_DOWNLOAD_LIMIT = 3;

const STORAGE_KEY = "inkmorph-daily-downloads-v1";

interface DailyDownloadStore {
  date: string;
  count: number;
}

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readStore(): DailyDownloadStore {
  if (typeof window === "undefined") {
    return { date: getLocalDateKey(), count: 0 };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { date: getLocalDateKey(), count: 0 };
    }

    const parsed = JSON.parse(raw) as Partial<DailyDownloadStore>;
    const today = getLocalDateKey();

    if (
      typeof parsed.date !== "string" ||
      typeof parsed.count !== "number" ||
      !Number.isFinite(parsed.count) ||
      parsed.count < 0
    ) {
      return { date: today, count: 0 };
    }

    if (parsed.date !== today) {
      return { date: today, count: 0 };
    }

    return {
      date: today,
      count: Math.min(Math.floor(parsed.count), DAILY_DOWNLOAD_LIMIT),
    };
  } catch {
    return { date: getLocalDateKey(), count: 0 };
  }
}

function writeStore(store: DailyDownloadStore): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Ignore quota / private-mode failures; downloads still work in-session.
  }
}

export function getDownloadsToday(): number {
  return readStore().count;
}

export function canDownloadToday(): boolean {
  return getDownloadsToday() < DAILY_DOWNLOAD_LIMIT;
}

/** Increments today's count after a successful download. */
export function recordSuccessfulDownload(): number {
  const store = readStore();
  const next = {
    date: getLocalDateKey(),
    count: Math.min(store.count + 1, DAILY_DOWNLOAD_LIMIT),
  };
  writeStore(next);
  return next.count;
}
