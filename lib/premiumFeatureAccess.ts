import type { DownloadSize } from "@/lib/constants";
import type { Illustration } from "@/types/illustration";

/** High-quality 2x downloads require a Pro plan. */
export function requiresPremiumForDownloadSize(
  size: DownloadSize,
  hasPremiumAccess: boolean
): boolean {
  return size === "2x" && !hasPremiumAccess;
}

/** Premium-tagged gallery assets require Pro for copy/download actions. */
export function isPremiumAssetLocked(
  illustration: Pick<Illustration, "premium">,
  hasPremiumAccess: boolean
): boolean {
  return Boolean(illustration.premium) && !hasPremiumAccess;
}

/** Copy protection applies only to individual premium gallery assets. */
export function shouldProtectGalleryAsset(
  illustration: Pick<Illustration, "premium">
): boolean {
  return Boolean(illustration.premium);
}

/** Any action that requires Pro for a free/basic user. */
export function requiresPremiumAccessForAction({
  size,
  illustration,
  hasPremiumAccess,
}: {
  size?: DownloadSize;
  illustration: Pick<Illustration, "premium">;
  hasPremiumAccess: boolean;
}): boolean {
  if (hasPremiumAccess) {
    return false;
  }

  if (size && requiresPremiumForDownloadSize(size, hasPremiumAccess)) {
    return true;
  }

  return isPremiumAssetLocked(illustration, hasPremiumAccess);
}

/** Pack icons marked `premium` are hidden until the user has Pro access. */
export function getAccessiblePackIllustrations(
  illustrations: Illustration[],
  hasPremiumAccess: boolean
): Illustration[] {
  if (hasPremiumAccess) {
    return illustrations;
  }

  return illustrations.filter((item) => !item.premium);
}

/** Gallery assets eligible for search discovery for the current plan. */
export function getSearchableGalleryIllustrations<T extends Illustration>(
  illustrations: T[],
  hasPremiumAccess: boolean
): T[] {
  if (hasPremiumAccess) {
    return illustrations;
  }

  return illustrations.filter((item) => !item.paywalled && !item.premium);
}
