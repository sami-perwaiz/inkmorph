const STORAGE_KEY = "inkmorph-user-profile";
export const PROFILE_CHANGE_EVENT = "inkmorph-profile-change";

export const DEFAULT_PROFILE_AVATAR = "/home/profile-avatar.png";
export const DEFAULT_PROFILE_NAME = "Sami Perwaiz";

export interface UserProfile {
  avatarSrc: string;
  fullName: string;
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function readUserProfile(): UserProfile {
  if (!isBrowser()) {
    return {
      avatarSrc: DEFAULT_PROFILE_AVATAR,
      fullName: DEFAULT_PROFILE_NAME,
    };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        avatarSrc: DEFAULT_PROFILE_AVATAR,
        fullName: DEFAULT_PROFILE_NAME,
      };
    }

    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    return {
      avatarSrc:
        typeof parsed.avatarSrc === "string" && parsed.avatarSrc.length > 0
          ? parsed.avatarSrc
          : DEFAULT_PROFILE_AVATAR,
      fullName:
        typeof parsed.fullName === "string" && parsed.fullName.trim().length > 0
          ? parsed.fullName.trim()
          : DEFAULT_PROFILE_NAME,
    };
  } catch {
    return {
      avatarSrc: DEFAULT_PROFILE_AVATAR,
      fullName: DEFAULT_PROFILE_NAME,
    };
  }
}

export function writeUserProfile(next: Partial<UserProfile>): UserProfile {
  const current = readUserProfile();
  const profile: UserProfile = {
    avatarSrc: next.avatarSrc ?? current.avatarSrc,
    fullName: next.fullName?.trim() || current.fullName,
  };

  if (!isBrowser()) {
    return profile;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event(PROFILE_CHANGE_EVENT));
  return profile;
}

export function clearUserProfilePhoto(): UserProfile {
  return writeUserProfile({ avatarSrc: DEFAULT_PROFILE_AVATAR });
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
