import { AUTH_CHANGE_EVENT } from "@/lib/authSession";
import { PREMIUM_CHANGE_EVENT } from "@/lib/premiumAccess";

/** Bump to wipe all client auth/account/premium state on next visit. */
export const AUTH_STORAGE_VERSION = 1;

const VERSION_KEY = "inkmorph-auth-storage-version";

const LOCAL_STORAGE_KEYS = [
  "inkmorph-signed-in",
  "inkmorph-auth-user",
  "inkmorph-google-accounts",
  "inkmorph-user-profiles-by-sub",
  "inkmorph-user-profile",
  "inkmorph-mock-purchases",
] as const;

const SESSION_STORAGE_KEYS = [
  "inkmorph-google-access-token",
  "inkmorph-google-signin-lock",
  "inkmorph-mock-checkout-draft",
] as const;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** Removes every InkMorph auth, profile, and mock purchase record from the browser. */
export function clearAllInkMorphClientAuthState(): void {
  if (!isBrowser()) {
    return;
  }

  for (const key of LOCAL_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }

  for (const key of SESSION_STORAGE_KEYS) {
    window.sessionStorage.removeItem(key);
  }

  void fetch("/api/downloads/premium", { method: "DELETE" }).catch(() => {});
  void fetch("/api/downloads/session", { method: "DELETE" }).catch(() => {});
}

function notifyClientStateReset(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
  window.dispatchEvent(new Event(PREMIUM_CHANGE_EVENT));
}

/**
 * Clears legacy test/seeded auth when the storage version changes.
 * Returns true when a reset was applied.
 */
export function ensureFreshAuthStorage(): boolean {
  if (!isBrowser()) {
    return false;
  }

  const storedVersion = Number(window.localStorage.getItem(VERSION_KEY) ?? "0");
  if (storedVersion >= AUTH_STORAGE_VERSION) {
    return false;
  }

  clearAllInkMorphClientAuthState();
  window.localStorage.setItem(VERSION_KEY, String(AUTH_STORAGE_VERSION));
  notifyClientStateReset();

  return true;
}
