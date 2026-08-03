import { mixIllustrations } from "@/lib/mixIllustrations";
import type { FilterValue, Illustration } from "@/types/illustration";

function sortBySrc(items: Illustration[]): Illustration[] {
  return [...items].sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));
}

export function filterIllustrations(
  items: Illustration[],
  filter: FilterValue
): Illustration[] {
  const threeDAvatar = items.filter((item) => item.category === "3d-avatar");
  const blackWhite = items.filter((item) => item.category === "black-white");

  if (filter === "all") {
    return mixIllustrations(threeDAvatar, blackWhite);
  }

  if (filter === "3d-avatar") {
    return sortBySrc(threeDAvatar);
  }

  return sortBySrc(blackWhite);
}
