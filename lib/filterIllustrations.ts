import type { FilterValue, Illustration } from "@/types/illustration";

export type IllustrationFilterLists = Record<FilterValue, Illustration[]>;

/** Free item counts per category (remaining items are paid/locked). */
export const FREE_COUNTS = {
  avatar: 10,
  character: 40,
  object: 50,
  abstract: 27,
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

/**
 * First `freeCount` items (existing sort order) stay free and list first;
 * remaining items are paid/locked and follow after.
 */
function applyFreePaidSplit(
  items: Illustration[],
  freeCount: number
): Illustration[] {
  const sorted = sortBySrc(items);
  const freeLimit = Math.min(Math.max(freeCount, 0), sorted.length);

  const free = sorted.slice(0, freeLimit).map((item) => ({
    ...item,
    premium: false,
  }));
  const paid = sorted.slice(freeLimit).map((item) => ({
    ...item,
    premium: true,
  }));

  return [...free, ...paid];
}

/**
 * Precompute every tab's illustration list once.
 * Tagged sets appear on their own tabs; All combines every category.
 * Within a tab: free items first, then paid/locked.
 */
export function buildIllustrationFilterLists(
  items: Illustration[]
): IllustrationFilterLists {
  const abstract = applyFreePaidSplit(
    items.filter(isAbstractIllustration),
    FREE_COUNTS.abstract
  );
  const character = applyFreePaidSplit(
    items.filter(isCharacterIllustration),
    FREE_COUNTS.character
  );
  const avatar = applyFreePaidSplit(
    items.filter(isAvatarIllustration),
    FREE_COUNTS.avatar
  );
  const object = applyFreePaidSplit(
    items.filter(
      (item) =>
        !isAbstractIllustration(item) &&
        !isCharacterIllustration(item) &&
        !isAvatarIllustration(item)
    ),
    FREE_COUNTS.object
  );

  // All: free items across categories first, then paid.
  const all = [
    ...avatar.filter((item) => !item.premium),
    ...character.filter((item) => !item.premium),
    ...object.filter((item) => !item.premium),
    ...abstract.filter((item) => !item.premium),
    ...avatar.filter((item) => item.premium),
    ...character.filter((item) => item.premium),
    ...object.filter((item) => item.premium),
    ...abstract.filter((item) => item.premium),
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

/** Visible gallery slice: all free items + paid peek for the faded bottom row.
 *  When free items don't fill the last row, include enough paid items to
 *  complete that row and still leave a full paid preview row under the fade.
 */
export function getVisibleGalleryItems(
  items: Illustration[],
  columnCount: number
): Illustration[] {
  const free: Illustration[] = [];
  const paid: Illustration[] = [];

  for (const item of items) {
    if (item.premium) {
      paid.push(item);
    } else {
      free.push(item);
    }
  }

  const cols = Math.max(1, columnCount);
  const remainder = free.length % cols;
  const fillPartialRow = remainder === 0 ? 0 : cols - remainder;
  const peekCount = fillPartialRow + cols;

  return [...free, ...paid.slice(0, peekCount)];
}
