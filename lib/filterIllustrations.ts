import type { FilterValue, Illustration } from "@/types/illustration";

export type IllustrationFilterLists = Record<FilterValue, Illustration[]>;

/** Free item counts per category (remaining items stay behind the paywall peek). */
export const FREE_COUNTS = {
  avatar: 10,
  character: 40,
  object: 50,
  abstract: 27,
} as const;

/**
 * How many of the currently visible free-plan items are premium-locked
 * (crown badge, no download) — evenly spaced through the free set.
 */
export const LOCKED_IN_FREE_COUNTS = {
  avatar: 5,
  character: 6,
  object: 6,
  abstract: 6,
} as const;

function sortBySrc(items: Illustration[]): Illustration[] {
  return [...items].sort((a, b) =>
    a.src.localeCompare(b.src, undefined, { numeric: true })
  );
}

function isAbstractIllustration(item: Illustration): boolean {
  return /abstract/i.test(item.filename);
}

function isCharacterIllustration(item: Illustration): boolean {
  return /character/i.test(item.filename);
}

function isAvatarIllustration(item: Illustration): boolean {
  return /avatar/i.test(item.filename);
}

/** Evenly spaced indices within `length` (e.g. 6 locks across 50 free items). */
function pickEvenIndices(length: number, count: number): Set<number> {
  const lockCount = Math.min(Math.max(count, 0), length);
  const indices = new Set<number>();

  if (lockCount === 0 || length === 0) {
    return indices;
  }

  if (lockCount === 1) {
    indices.add(Math.floor((length - 1) / 2));
    return indices;
  }

  for (let i = 0; i < lockCount; i++) {
    indices.add(Math.round((i * (length - 1)) / (lockCount - 1)));
  }

  return indices;
}

/**
 * First `freeCount` items stay on the free-plan gallery (order unchanged).
 * Within those, `lockedInFreeCount` are marked premium (locked) but still visible.
 * Remaining items are paywalled (premium + faded peek only).
 */
function applyFreePaidSplit(
  items: Illustration[],
  freeCount: number,
  lockedInFreeCount: number
): Illustration[] {
  const sorted = sortBySrc(items);
  const freeLimit = Math.min(Math.max(freeCount, 0), sorted.length);
  const freeSlice = sorted.slice(0, freeLimit);
  const paidSlice = sorted.slice(freeLimit);
  const lockedIndices = pickEvenIndices(freeSlice.length, lockedInFreeCount);

  const free = freeSlice.map((item, index) => ({
    ...item,
    premium: lockedIndices.has(index),
    paywalled: false,
  }));
  const paid = paidSlice.map((item) => ({
    ...item,
    premium: true,
    paywalled: true,
  }));

  return [...free, ...paid];
}

/**
 * Precompute every tab's illustration list once.
 * Tagged sets appear on their own tabs; All combines every category.
 * Within a tab: free-plan items first (some premium-locked), then paywalled.
 */
export function buildIllustrationFilterLists(
  items: Illustration[]
): IllustrationFilterLists {
  const abstract = applyFreePaidSplit(
    items.filter(isAbstractIllustration),
    FREE_COUNTS.abstract,
    LOCKED_IN_FREE_COUNTS.abstract
  );
  const character = applyFreePaidSplit(
    items.filter(isCharacterIllustration),
    FREE_COUNTS.character,
    LOCKED_IN_FREE_COUNTS.character
  );
  const avatar = applyFreePaidSplit(
    items.filter(isAvatarIllustration),
    FREE_COUNTS.avatar,
    LOCKED_IN_FREE_COUNTS.avatar
  );
  const object = applyFreePaidSplit(
    items.filter(
      (item) =>
        !isAbstractIllustration(item) &&
        !isCharacterIllustration(item) &&
        !isAvatarIllustration(item)
    ),
    FREE_COUNTS.object,
    LOCKED_IN_FREE_COUNTS.object
  );

  const visible = (list: Illustration[]) =>
    list.filter((item) => !item.paywalled);
  const paywalled = (list: Illustration[]) =>
    list.filter((item) => item.paywalled);

  // All: free-plan items across categories first, then paywalled peek pool.
  const all = [
    ...visible(avatar),
    ...visible(character),
    ...visible(object),
    ...visible(abstract),
    ...paywalled(avatar),
    ...paywalled(character),
    ...paywalled(object),
    ...paywalled(abstract),
  ];

  return {
    all,
    avatar,
    character,
    object,
    abstract,
  };
}

export function filterIllustrations(
  items: Illustration[],
  filter: FilterValue
): Illustration[] {
  return buildIllustrationFilterLists(items)[filter];
}

/** Visible gallery slice: free-plan items + paywalled peek for the faded bottom row.
 *  When free-plan items don't fill the last row, include enough paywalled items to
 *  complete that row and still leave a full paid preview row under the fade.
 */
export function getVisibleGalleryItems(
  items: Illustration[],
  columnCount: number
): Illustration[] {
  const freePlan: Illustration[] = [];
  const paywalled: Illustration[] = [];

  for (const item of items) {
    if (item.paywalled) {
      paywalled.push(item);
    } else {
      freePlan.push(item);
    }
  }

  const cols = Math.max(1, columnCount);
  const remainder = freePlan.length % cols;
  const fillPartialRow = remainder === 0 ? 0 : cols - remainder;
  const peekCount = fillPartialRow + cols;

  return [...freePlan, ...paywalled.slice(0, peekCount)];
}
