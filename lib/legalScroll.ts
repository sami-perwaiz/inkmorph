export const LEGAL_PAGE_PATHS = ["/license", "/privacy", "/terms"] as const;

export type LegalScrollPagePath = (typeof LEGAL_PAGE_PATHS)[number];

export function isLegalPagePath(path: string): path is LegalScrollPagePath {
  return (LEGAL_PAGE_PATHS as readonly string[]).includes(path);
}

interface StoredPageState {
  scrollY: number;
  searchQuery?: string;
}

function pageStateKey(path: string): string {
  return `inkmorph-page-state:${path}`;
}

const DIRECTION_KEY = "inkmorph-legal-nav-direction";

let scrollPersistenceLocked = false;

/** Suppress debounced scroll writes during route transitions. */
export function lockScrollPersistence(): void {
  scrollPersistenceLocked = true;
}

export function unlockScrollPersistence(): void {
  scrollPersistenceLocked = false;
}

export function isScrollPersistenceLocked(): boolean {
  return scrollPersistenceLocked;
}

function readPageState(path: string): StoredPageState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = sessionStorage.getItem(pageStateKey(path));
  if (raw === null) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredPageState;
    if (typeof parsed.scrollY !== "number" || !Number.isFinite(parsed.scrollY)) {
      return null;
    }

    return {
      scrollY: parsed.scrollY,
      searchQuery:
        typeof parsed.searchQuery === "string" ? parsed.searchQuery : undefined,
    };
  } catch {
    return null;
  }
}

function writePageState(path: string, state: StoredPageState): void {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(pageStateKey(path), JSON.stringify(state));
}

/** Persist scroll and optional search for a route before leaving it. */
export function savePageState(
  path: string,
  partial?: Partial<StoredPageState>
): void {
  if (typeof window === "undefined" || isScrollPersistenceLocked()) {
    return;
  }

  const existing = readPageState(path);
  writePageState(path, {
    scrollY: partial?.scrollY ?? window.scrollY,
    searchQuery: partial?.searchQuery ?? existing?.searchQuery,
  });
}

export function setPageScroll(path: string, scrollY: number): void {
  if (typeof window === "undefined") {
    return;
  }

  const existing = readPageState(path);
  writePageState(path, {
    scrollY,
    searchQuery: existing?.searchQuery,
  });
}

export function savePageScroll(path: string): void {
  savePageState(path);
}

export function savePageSearch(path: string, searchQuery: string): void {
  savePageState(path, { searchQuery });
}

export function getSavedSearchQuery(path: string): string {
  return readPageState(path)?.searchQuery ?? "";
}

export function restorePageScroll(path: string): void {
  const saved = readPageState(path);
  if (saved === null) {
    return;
  }

  const top = saved.scrollY;
  const apply = () => {
    window.scrollTo({ top, left: 0, behavior: "auto" });
  };

  apply();

  window.requestAnimationFrame(() => {
    apply();
    window.requestAnimationFrame(apply);
  });

  window.setTimeout(apply, 0);
  window.setTimeout(apply, 50);
  window.setTimeout(apply, 150);
}

/** Call before navigating forward to a legal page from an in-app link. */
export function prepareLegalNavigation(fromPath: string): void {
  lockScrollPersistence();
  savePageState(fromPath, { scrollY: window.scrollY });
  markLegalForwardNavigation();
}

export function markLegalForwardNavigation(): void {
  sessionStorage.setItem(DIRECTION_KEY, "forward");
}

export function markLegalBackNavigation(): void {
  sessionStorage.setItem(DIRECTION_KEY, "back");
}

export function consumeLegalNavigationDirection():
  | "forward"
  | "back"
  | null {
  const direction = sessionStorage.getItem(DIRECTION_KEY);
  sessionStorage.removeItem(DIRECTION_KEY);
  return direction === "forward" || direction === "back" ? direction : null;
}

export function canUseHistoryBack(): boolean {
  return window.history.length > 1;
}

/** Scroll a forward legal route to the top without animation or flash. */
export function resetLegalPageScroll(path: string): void {
  setPageScroll(path, 0);
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}
