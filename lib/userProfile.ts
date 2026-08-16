const PROFILES_STORAGE_KEY = "inkmorph-user-profiles-by-sub";
const LEGACY_PROFILE_KEY = "inkmorph-user-profile";
export const PROFILE_CHANGE_EVENT = "inkmorph-profile-change";

export const DEFAULT_PROFILE_AVATAR = "/home/profile-avatar.png";
export const DEFAULT_PROFILE_NAME = "";

export interface UserProfile {
  avatarSrc: string;
  fullName: string;
}

interface ProfilesStore {
  bySub: Record<string, UserProfile>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getActiveUserSub(): string | null {
  if (!isBrowser() || window.localStorage.getItem("inkmorph-signed-in") !== "1") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("inkmorph-auth-user");
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { sub?: string };
    return typeof parsed.sub === "string" ? parsed.sub : null;
  } catch {
    return null;
  }
}

function emptyProfile(): UserProfile {
  return {
    avatarSrc: DEFAULT_PROFILE_AVATAR,
    fullName: DEFAULT_PROFILE_NAME,
  };
}

function readProfilesStore(): ProfilesStore {
  if (!isBrowser()) {
    return { bySub: {} };
  }

  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
    if (!raw) {
      return { bySub: {} };
    }

    const parsed = JSON.parse(raw) as Partial<ProfilesStore>;
    if (!parsed.bySub || typeof parsed.bySub !== "object") {
      return { bySub: {} };
    }

    return { bySub: parsed.bySub };
  } catch {
    return { bySub: {} };
  }
}

function writeProfilesStore(store: ProfilesStore): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(store));
}

function migrateLegacyProfile(sub: string): UserProfile | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(LEGACY_PROFILE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const profile: UserProfile = {
      avatarSrc:
        typeof parsed.avatarSrc === "string" && parsed.avatarSrc.length > 0
          ? parsed.avatarSrc
          : DEFAULT_PROFILE_AVATAR,
      fullName:
        typeof parsed.fullName === "string" ? parsed.fullName.trim() : "",
    };

    const store = readProfilesStore();
    store.bySub[sub] = profile;
    writeProfilesStore(store);
    window.localStorage.removeItem(LEGACY_PROFILE_KEY);
    return profile;
  } catch {
    return null;
  }
}

export function readUserProfile(sub = getActiveUserSub()): UserProfile {
  if (!sub) {
    return emptyProfile();
  }

  const store = readProfilesStore();
  const existing = store.bySub[sub];
  if (existing) {
    return existing;
  }

  const migrated = migrateLegacyProfile(sub);
  if (migrated) {
    return migrated;
  }

  return emptyProfile();
}

export function writeUserProfile(
  next: Partial<UserProfile>,
  sub = getActiveUserSub()
): UserProfile {
  if (!sub) {
    return emptyProfile();
  }

  const current = readUserProfile(sub);
  const profile: UserProfile = {
    avatarSrc: next.avatarSrc ?? current.avatarSrc,
    fullName: next.fullName?.trim() || current.fullName,
  };

  if (!isBrowser()) {
    return profile;
  }

  const store = readProfilesStore();
  store.bySub[sub] = profile;
  writeProfilesStore(store);
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
  return profile;
}

export function clearUserProfilePhoto(sub = getActiveUserSub()): UserProfile {
  return writeUserProfile({ avatarSrc: DEFAULT_PROFILE_AVATAR }, sub);
}

/** True when Next/Image must skip optimization (data URLs, blobs, remote avatars). */
export function isCustomAvatarSrc(src: string): boolean {
  return (
    src.startsWith("data:") ||
    src.startsWith("blob:") ||
    src.startsWith("https://lh3.googleusercontent.com/")
  );
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () => reject(reader.error ?? new Error("File read failed."));
    reader.readAsDataURL(file);
  });
}

export function hasCompletedProfile(sub: string): boolean {
  const profile = readUserProfile(sub);
  return profile.fullName.trim().length > 0;
}
