import {
  revokeGoogleAccess,
  type GoogleUserProfile,
} from "@/lib/googleAuth";
import { writeUserProfile } from "@/lib/userProfile";

const STORAGE_KEY = "inkmorph-signed-in";
const USER_STORAGE_KEY = "inkmorph-auth-user";
const ACCOUNTS_STORAGE_KEY = "inkmorph-google-accounts";
export const AUTH_CHANGE_EVENT = "inkmorph-auth-change";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface StoredAccount extends AuthUser {
  createdAt: string;
}

interface AccountsStore {
  bySub: Record<string, StoredAccount>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyAuthChange(): void {
  if (!isBrowser()) {
    return;
  }
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function readAccountsStore(): AccountsStore {
  if (!isBrowser()) {
    return { bySub: {} };
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      return { bySub: {} };
    }
    const parsed = JSON.parse(raw) as Partial<AccountsStore>;
    if (!parsed.bySub || typeof parsed.bySub !== "object") {
      return { bySub: {} };
    }
    return { bySub: parsed.bySub };
  } catch {
    return { bySub: {} };
  }
}

function writeAccountsStore(store: AccountsStore): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(store));
}

function toAuthUser(profile: GoogleUserProfile): AuthUser {
  return {
    sub: profile.sub,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  };
}

export function isSignedIn(): boolean {
  if (!isBrowser()) {
    return false;
  }

  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

/** True when at least one Google account has been registered on this device. */
export function hasRegisteredAccounts(): boolean {
  return Object.keys(readAccountsStore().bySub).length > 0;
}

/**
 * First-time visitors → Create Account (/signup).
 * Returning visitors with a saved account → Sign In (/signin).
 */
export function getAuthEntryHref(nextPath?: string | null): string {
  const base = hasRegisteredAccounts() ? "/signin" : "/signup";

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return base;
  }

  return `${base}?next=${encodeURIComponent(nextPath)}`;
}

export function getAuthUser(): AuthUser | null {
  if (!isBrowser() || !isSignedIn()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<AuthUser>;
    if (!parsed.sub || !parsed.email) {
      return null;
    }
    return {
      sub: parsed.sub,
      email: parsed.email,
      name: typeof parsed.name === "string" ? parsed.name : parsed.email,
      picture: typeof parsed.picture === "string" ? parsed.picture : "",
    };
  } catch {
    return null;
  }
}

/**
 * Registers or reuses a Google account, then persists the signed-in session.
 * Returns whether this Google identity was new to InkMorph.
 */
export function completeGoogleSignIn(profile: GoogleUserProfile): {
  user: AuthUser;
  isNewAccount: boolean;
} {
  const user = toAuthUser(profile);
  const store = readAccountsStore();
  const existing = store.bySub[user.sub];
  const isNewAccount = !existing;

  store.bySub[user.sub] = {
    ...user,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
  writeAccountsStore(store);

  if (!isBrowser()) {
    return { user, isNewAccount };
  }

  window.localStorage.setItem(STORAGE_KEY, "1");
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

  if (isNewAccount) {
    writeUserProfile({
      fullName: user.name,
      ...(user.picture ? { avatarSrc: user.picture } : {}),
    });
  }

  notifyAuthChange();
  return { user, isNewAccount };
}

/** @deprecated Prefer completeGoogleSignIn / signOut — kept for existing call sites. */
export function setSignedIn(value: boolean): void {
  if (!isBrowser()) {
    return;
  }

  if (value) {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } else {
    signOut();
    return;
  }

  notifyAuthChange();
}

/** Ends the authenticated session and revokes the Google access token when possible. */
export function signOut(): void {
  if (!isBrowser()) {
    return;
  }

  revokeGoogleAccess();
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
  notifyAuthChange();
}
