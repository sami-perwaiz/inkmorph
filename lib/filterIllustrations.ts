import { mixIllustrations } from "@/lib/mixIllustrations";
import type { FilterValue, Illustration } from "@/types/illustration";

export type IllustrationFilterLists = Record<FilterValue, Illustration[]>;

function sortBySrc(items: Illustration[]): Illustration[] {
  return [...items].sort((a, b) =>
    a.src.localeCompare(b.src, undefined, { numeric: true })
  );
}

/**
 * Precompute every tab's illustration list once.
 * Tab switches should only look up a stable array reference.
 */
export function buildIllustrationFilterLists(
  items: Illustration[]
): IllustrationFilterLists {
  const threeDAvatar: Illustration[] = [];
  const blackWhite: Illustration[] = [];

  for (const item of items) {
    if (item.category === "3d-avatar") {
      threeDAvatar.push(item);
    } else {
      blackWhite.push(item);
    }
  }

  return {
    all: mixIllustrations(threeDAvatar, blackWhite),
    "3d-avatar": sortBySrc(threeDAvatar),
    "black-white": sortBySrc(blackWhite),
  };
}

export function filterIllustrations(
  items: Illustration[],
  filter: FilterValue
): Illustration[] {
  return buildIllustrationFilterLists(items)[filter];
}
