import {
  revokeGoogleAccess,
  type GoogleUserProfile,
} from "@/lib/googleAuth";
import { hasCompletedProfile, writeUserProfile } from "@/lib/userProfile";

const STORAGE_KEY = "inkmorph-signed-in";
const USER_STORAGE_KEY = "inkmorph-auth-user";
const ACCOUNTS_STORAGE_KEY = "inkmorph-google-accounts";
const SIGN_IN_LOCK_KEY = "inkmorph-google-signin-lock";
export const AUTH_CHANGE_EVENT = "inkmorph-auth-change";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

interface StoredAccount extends AuthUser {
  createdAt: string;
  profileComplete: boolean;
  /** When true, user must set a password before continuing. Google-only accounts stay false. */
  passwordRequired: boolean;
  passwordHash?: string;
}

interface AccountsStore {
  bySub: Record<string, StoredAccount>;
  byEmail: Record<string, string>;
}

export class AuthConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthConflictError";
  }
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string, sub: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${sub}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function resolveNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }

  return raw;
}

export function buildAuthFlowHref(
  path: string,
  options?: { setup?: boolean; next?: string | null }
): string {
  const params = new URLSearchParams();

  if (options?.setup) {
    params.set("setup", "1");
  }

  const next = options?.next;
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    params.set("next", next);
  }

  const query = params.toString();
  return query ? `${path}?${query}` : path;
}

function migrateAccountsStore(raw: Partial<AccountsStore>): AccountsStore {
  const bySub: Record<string, StoredAccount> = {};
  const byEmail: Record<string, string> = {};

  if (raw.bySub && typeof raw.bySub === "object") {
    for (const [sub, account] of Object.entries(raw.bySub)) {
      if (!account?.sub || !account.email) {
        continue;
      }

      const stored: StoredAccount = {
        sub: account.sub,
        email: account.email,
        name: typeof account.name === "string" ? account.name : account.email,
        picture: typeof account.picture === "string" ? account.picture : "",
        createdAt:
          typeof account.createdAt === "string"
            ? account.createdAt
            : new Date().toISOString(),
        profileComplete:
          typeof account.profileComplete === "boolean"
            ? account.profileComplete
            : hasCompletedProfile(account.sub),
        passwordRequired:
          typeof account.passwordRequired === "boolean"
            ? account.passwordRequired
            : false,
        passwordHash:
          typeof account.passwordHash === "string"
            ? account.passwordHash
            : undefined,
      };

      bySub[sub] = stored;
      byEmail[normalizeEmail(stored.email)] = stored.sub;
    }
  }

  if (raw.byEmail && typeof raw.byEmail === "object") {
    for (const [email, sub] of Object.entries(raw.byEmail)) {
      if (typeof sub === "string" && bySub[sub]) {
        byEmail[normalizeEmail(email)] = sub;
      }
    }
  }

  return { bySub, byEmail };
}

function readAccountsStore(): AccountsStore {
  if (!isBrowser()) {
    return { bySub: {}, byEmail: {} };
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      return { bySub: {}, byEmail: {} };
    }

    return migrateAccountsStore(JSON.parse(raw) as Partial<AccountsStore>);
  } catch {
    return { bySub: {}, byEmail: {} };
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

function findExistingAccount(
  profile: GoogleUserProfile,
  store: AccountsStore
): StoredAccount | null {
  const bySub = store.bySub[profile.sub];
  if (bySub) {
    return bySub;
  }

  const emailKey = normalizeEmail(profile.email);
  const linkedSub = store.byEmail[emailKey];
  if (!linkedSub) {
    return null;
  }

  return store.bySub[linkedSub] ?? null;
}

function acquireSignInLock(): () => void {
  if (!isBrowser()) {
    return () => undefined;
  }

  const lockId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const deadline = Date.now() + 3000;

  while (Date.now() < deadline) {
    const current = window.sessionStorage.getItem(SIGN_IN_LOCK_KEY);
    if (!current) {
      window.sessionStorage.setItem(SIGN_IN_LOCK_KEY, lockId);
      if (window.sessionStorage.getItem(SIGN_IN_LOCK_KEY) === lockId) {
        return () => {
          if (window.sessionStorage.getItem(SIGN_IN_LOCK_KEY) === lockId) {
            window.sessionStorage.removeItem(SIGN_IN_LOCK_KEY);
          }
        };
      }
    }
  }

  throw new AuthConflictError(
    "Another sign-in is already in progress. Please try again."
  );
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

/** Unified auth entry — Google handles both new and returning users. */
export function getAuthEntryHref(nextPath?: string | null): string {
  const base = "/signin";

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

export function markProfileComplete(sub?: string): void {
  const activeSub = sub ?? getAuthUser()?.sub;
  if (!activeSub || !isBrowser()) {
    return;
  }

  const store = readAccountsStore();
  const account = store.bySub[activeSub];
  if (!account) {
    return;
  }

  store.bySub[activeSub] = {
    ...account,
    profileComplete: true,
  };
  writeAccountsStore(store);
}

export function needsProfileSetup(user: AuthUser): boolean {
  const store = readAccountsStore();
  const account = store.bySub[user.sub];
  if (account?.profileComplete) {
    return false;
  }

  return !hasCompletedProfile(user.sub);
}

export function needsPasswordSetup(user: AuthUser): boolean {
  const store = readAccountsStore();
  const account = store.bySub[user.sub];
  if (!account?.passwordRequired) {
    return false;
  }

  return !account.passwordHash;
}

export function markPasswordRequired(sub?: string): void {
  const activeSub = sub ?? getAuthUser()?.sub;
  if (!activeSub || !isBrowser()) {
    return;
  }

  const store = readAccountsStore();
  const account = store.bySub[activeSub];
  if (!account) {
    return;
  }

  store.bySub[activeSub] = {
    ...account,
    passwordRequired: true,
  };
  writeAccountsStore(store);
}

export async function setAccountPassword(
  password: string,
  sub?: string
): Promise<void> {
  const activeSub = sub ?? getAuthUser()?.sub;
  if (!activeSub || !isBrowser()) {
    throw new AuthConflictError("Sign in before setting a password.");
  }

  const store = readAccountsStore();
  const account = store.bySub[activeSub];
  if (!account) {
    throw new AuthConflictError("Account not found.");
  }

  const passwordHash = await hashPassword(password, activeSub);

  store.bySub[activeSub] = {
    ...account,
    passwordRequired: true,
    passwordHash,
  };
  writeAccountsStore(store);
}

export async function verifyAccountPassword(
  password: string,
  sub?: string
): Promise<boolean> {
  const activeSub = sub ?? getAuthUser()?.sub;
  if (!activeSub) {
    return false;
  }

  const account = readAccountsStore().bySub[activeSub];
  if (!account?.passwordHash) {
    return false;
  }

  const passwordHash = await hashPassword(password, activeSub);
  return passwordHash === account.passwordHash;
}

function persistSignedInSession(user: AuthUser): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, "1");
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  notifyAuthChange();
}

/**
 * Registers an email account that still needs a password.
 * Used by email sign-up; Google accounts do not call this.
 */
export function registerEmailAccount(email: string, name?: string): AuthUser {
  const trimmedEmail = email.trim();
  const normalized = normalizeEmail(trimmedEmail);

  if (!trimmedEmail || !normalized.includes("@")) {
    throw new AuthConflictError("Enter a valid email address.");
  }

  const store = readAccountsStore();
  const existingSub = store.byEmail[normalized];
  if (existingSub && store.bySub[existingSub]) {
    throw new AuthConflictError("An account with this email already exists.");
  }

  const sub = `email:${normalized}`;
  const user: AuthUser = {
    sub,
    email: trimmedEmail,
    name: name?.trim() || trimmedEmail,
    picture: "",
  };

  store.bySub[sub] = {
    ...user,
    createdAt: new Date().toISOString(),
    profileComplete: false,
    passwordRequired: true,
  };
  store.byEmail[normalized] = sub;
  writeAccountsStore(store);
  persistSignedInSession(user);

  return user;
}

/** Signs in with email + password, or resumes setup when a password is still required. */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<AuthUser> {
  const normalized = normalizeEmail(email.trim());
  const store = readAccountsStore();
  const sub = store.byEmail[normalized];
  const account = sub ? store.bySub[sub] : null;

  if (!account) {
    throw new AuthConflictError(
      "No account found for this email. Sign in with Google or create an account."
    );
  }

  const user: AuthUser = {
    sub: account.sub,
    email: account.email,
    name: account.name,
    picture: account.picture,
  };

  if (!account.passwordHash) {
    if (!account.passwordRequired) {
      throw new AuthConflictError(
        "This account uses Google sign-in. Continue with Google instead."
      );
    }

    persistSignedInSession(user);
    return user;
  }

  const isValid = await verifyAccountPassword(password, account.sub);
  if (!isValid) {
    throw new AuthConflictError("Incorrect password.");
  }

  persistSignedInSession(user);
  return user;
}

/**
 * Registers or reuses a Google account, then persists the signed-in session.
 * Matches by Google `sub` first, then verified email — never creates duplicates.
 */
export function completeGoogleSignIn(profile: GoogleUserProfile): {
  user: AuthUser;
  isNewAccount: boolean;
} {
  if (!profile.sub?.trim()) {
    throw new AuthConflictError("Google account is missing a user identifier.");
  }

  if (!profile.email?.trim()) {
    throw new AuthConflictError(
      "Google account does not include a usable email address."
    );
  }

  const releaseLock = acquireSignInLock();

  try {
    const store = readAccountsStore();
    const existing = findExistingAccount(profile, store);
    const isNewAccount = !existing;

    const canonicalSub = existing?.sub ?? profile.sub;
    const user: AuthUser = {
      ...toAuthUser(profile),
      sub: canonicalSub,
    };

    const profileComplete =
      existing?.profileComplete ?? hasCompletedProfile(canonicalSub);

    store.bySub[canonicalSub] = {
      ...user,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      profileComplete,
      passwordRequired: existing?.passwordRequired ?? false,
      passwordHash: existing?.passwordHash,
    };

    if (profile.sub !== canonicalSub) {
      delete store.bySub[profile.sub];
    }

    store.byEmail[normalizeEmail(user.email)] = canonicalSub;
    writeAccountsStore(store);

    if (!isBrowser()) {
      return { user, isNewAccount };
    }

    window.localStorage.setItem(STORAGE_KEY, "1");
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    if (isNewAccount) {
      writeUserProfile(
        {
          fullName: user.name,
          ...(user.picture ? { avatarSrc: user.picture } : {}),
        },
        canonicalSub
      );
    }

    notifyAuthChange();
    return { user, isNewAccount };
  } finally {
    releaseLock();
  }
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
  void fetch("/api/downloads/premium", { method: "DELETE" }).catch(() => {});
  void fetch("/api/downloads/session", { method: "DELETE" }).catch(() => {});
  notifyAuthChange();
}
