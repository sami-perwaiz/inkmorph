import { AUTH_CHANGE_EVENT, getAuthUser } from "@/lib/authSession";
import { syncPremiumDownloadSession } from "@/lib/downloadLimitApi";

const STORAGE_KEY = "inkmorph-premium-by-sub";
export const PREMIUM_CHANGE_EVENT = "inkmorph-premium-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyPremiumChange(): void {
  if (!isBrowser()) {
    return;
  }
  window.dispatchEvent(new Event(PREMIUM_CHANGE_EVENT));
}

function readPremiumBySub(): Record<string, boolean> {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    return parsed as Record<string, boolean>;
  } catch {
    return {};
  }
}

function writePremiumBySub(map: Record<string, boolean>): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/** True when the signed-in user has purchased premium access. */
export function hasPremiumAccess(): boolean {
  const user = getAuthUser();
  if (!user) {
    return false;
  }

  return Boolean(readPremiumBySub()[user.sub]);
}

/** Grants premium access to the current signed-in user (checkout stub). */
export function grantPremiumAccess(): void {
  const user = getAuthUser();
  if (!user) {
    return;
  }

  const map = readPremiumBySub();
  map[user.sub] = true;
  writePremiumBySub(map);
  notifyPremiumChange();
  void syncPremiumDownloadSession(true);
}

export { AUTH_CHANGE_EVENT };
