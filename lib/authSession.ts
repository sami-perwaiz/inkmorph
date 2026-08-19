import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updatePassword,
  getAdditionalUserInfo,
  type User,
} from "firebase/auth";

import { AuthConflictError } from "@/lib/authErrors";
import { getFirebaseAuth, tryGetFirebaseAuth } from "@/lib/firebase";
import { mapFirebaseAuthError } from "@/lib/firebaseAuthErrors";
import { hasCompletedProfile, writeUserProfile } from "@/lib/userProfile";

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
}

export const AUTH_CHANGE_EVENT = "inkmorph-auth-change";

const PROFILE_COMPLETE_STORAGE_KEY = "inkmorph-profile-complete-by-sub";

let cachedUser: AuthUser | null = null;
let authReady = false;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function notifyAuthChange(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function mapFirebaseUser(user: User): AuthUser {
  return {
    sub: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? user.email ?? "",
    picture: user.photoURL ?? "",
  };
}

export function syncAuthUserFromFirebase(user: User | null): void {
  cachedUser = user ? mapFirebaseUser(user) : null;
}

export function setAuthReadyState(ready: boolean): void {
  authReady = ready;
}

export function isAuthReady(): boolean {
  return authReady;
}

function readProfileCompleteStore(): Record<string, boolean> {
  if (!isBrowser()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_COMPLETE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const store: Record<string, boolean> = {};

    for (const [sub, value] of Object.entries(parsed)) {
      if (value === true) {
        store[sub] = true;
      }
    }

    return store;
  } catch {
    return {};
  }
}

function writeProfileCompleteStore(store: Record<string, boolean>): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PROFILE_COMPLETE_STORAGE_KEY, JSON.stringify(store));
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

export function getAuthUser(): AuthUser | null {
  if (!isBrowser() || !authReady) {
    return null;
  }

  const auth = tryGetFirebaseAuth();
  if (!auth) {
    return null;
  }

  const current = auth.currentUser;
  if (current) {
    cachedUser = mapFirebaseUser(current);
    return cachedUser;
  }

  return cachedUser;
}

export function isSignedIn(): boolean {
  return getAuthUser() !== null;
}

export function getAuthEntryHref(nextPath?: string | null): string {
  const base = "/signin";

  if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) {
    return base;
  }

  return `${base}?next=${encodeURIComponent(nextPath)}`;
}

export function markProfileComplete(sub?: string): void {
  const activeSub = sub ?? getAuthUser()?.sub;
  if (!activeSub || !isBrowser()) {
    return;
  }

  const store = readProfileCompleteStore();
  store[activeSub] = true;
  writeProfileCompleteStore(store);
}

export function needsProfileSetup(user: AuthUser): boolean {
  return !readProfileCompleteStore()[user.sub];
}

/** One-time migration for profiles saved before completion tracking existed. */
export function migrateLegacyProfileCompletion(user: AuthUser): void {
  if (readProfileCompleteStore()[user.sub]) {
    return;
  }

  if (hasCompletedProfile(user.sub)) {
    markProfileComplete(user.sub);
  }
}

function getFirebaseUserForAuthUser(user: AuthUser): User | null {
  if (!isBrowser() || !authReady) {
    return null;
  }

  const firebaseUser = tryGetFirebaseAuth()?.currentUser;
  if (!firebaseUser || firebaseUser.uid !== user.sub) {
    return null;
  }

  return firebaseUser;
}

function userHasPasswordProvider(firebaseUser: User): boolean {
  return firebaseUser.providerData.some(
    (provider) => provider.providerId === "password"
  );
}

export function needsPasswordSetup(user: AuthUser): boolean {
  const firebaseUser = getFirebaseUserForAuthUser(user);
  if (!firebaseUser) {
    return false;
  }

  if (userHasPasswordProvider(firebaseUser)) {
    return false;
  }

  return firebaseUser.providerData.some(
    (provider) => provider.providerId === "google.com"
  );
}

export async function setAccountPassword(password: string): Promise<void> {
  const firebaseUser = getFirebaseAuth().currentUser;
  if (!firebaseUser) {
    throw new AuthConflictError("Sign in before setting a password.");
  }

  const email = firebaseUser.email?.trim();
  if (!email) {
    throw new AuthConflictError(
      "Your account must include a verified email address to set a password."
    );
  }

  try {
    if (userHasPasswordProvider(firebaseUser)) {
      await updatePassword(firebaseUser, password);
    } else {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(firebaseUser, credential);
    }

    await firebaseUser.reload();
    cachedUser = mapFirebaseUser(firebaseUser);
    notifyAuthChange();
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const credential = await signInWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );
    const user = mapFirebaseUser(credential.user);
    cachedUser = user;
    notifyAuthChange();
    return user;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

export async function registerEmailAccount(
  email: string,
  password: string,
  name?: string
): Promise<AuthUser> {
  try {
    const credential = await createUserWithEmailAndPassword(
      getFirebaseAuth(),
      email.trim(),
      password
    );

    const user = mapFirebaseUser(credential.user);
    cachedUser = user;

    writeUserProfile(
      {
        fullName: name?.trim() || user.name,
      },
      user.sub
    );

    notifyAuthChange();
    return user;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

export async function signInWithGoogle(): Promise<{
  user: AuthUser;
  isNewAccount: boolean;
}> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const result = await signInWithPopup(getFirebaseAuth(), provider);
    const additional = getAdditionalUserInfo(result);
    const user = mapFirebaseUser(result.user);
    cachedUser = user;
    const isNewAccount = additional?.isNewUser ?? false;

    if (isNewAccount && user.picture) {
      // Seed avatar only — Complete Profile collects/confirms the display name.
      writeUserProfile({ avatarSrc: user.picture }, user.sub);
    }

    notifyAuthChange();
    return { user, isNewAccount };
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/** @deprecated Prefer Firebase signOut — kept for existing call sites. */
export function setSignedIn(value: boolean): void {
  if (!value) {
    void signOut();
  }
}

export function signOut(): void {
  if (!isBrowser()) {
    return;
  }

  cachedUser = null;

  const auth = tryGetFirebaseAuth();
  if (!auth) {
    void fetch("/api/downloads/premium", { method: "DELETE" }).catch(() => {});
    void fetch("/api/downloads/session", { method: "DELETE" }).catch(() => {});
    notifyAuthChange();
    return;
  }

  void firebaseSignOut(auth)
    .catch(() => undefined)
    .finally(() => {
      void fetch("/api/downloads/premium", { method: "DELETE" }).catch(() => {});
      void fetch("/api/downloads/session", { method: "DELETE" }).catch(() => {});
      notifyAuthChange();
    });
}

export { AuthConflictError } from "@/lib/authErrors";
