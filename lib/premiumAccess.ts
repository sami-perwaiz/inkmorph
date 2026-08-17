import { AUTH_CHANGE_EVENT, getAuthUser } from "@/lib/authSession";
import { isTestingPremiumUser } from "@/lib/testingPremiumAccess";

const STORAGE_KEY = "inkmorph-premium-by-sub";
export const PREMIUM_CHANGE_EVENT = "inkmorph-premium-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
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

/** True when the signed-in user has premium access (testing account or purchased). */
export function hasPremiumAccess(): boolean {
  const user = getAuthUser();
  if (!user) {
    return false;
  }

  if (isTestingPremiumUser(user.email)) {
    return true;
  }

  return Boolean(readPremiumBySub()[user.sub]);
}

/** Grants premium access to the current signed-in user (checkout stub). */
export function grantPremiumAccess(): void {
  // Disabled during testing — only isTestingPremiumUser grants premium access.
}

export { AUTH_CHANGE_EVENT };
