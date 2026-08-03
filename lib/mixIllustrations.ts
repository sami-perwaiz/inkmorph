import type { Illustration } from "@/types/illustration";

function sortBySrc(items: Illustration[]): Illustration[] {
  return [...items].sort((a, b) => a.src.localeCompare(b.src, undefined, { numeric: true }));
}

/**
 * Proportionally interleaves two sorted lists for a stable, balanced mix.
 * Order is deterministic across refreshes and builds.
 */
export function mixIllustrations(
  threeD: Illustration[],
  blackWhite: Illustration[]
): Illustration[] {
  const sortedThreeD = sortBySrc(threeD);
  const sortedBlackWhite = sortBySrc(blackWhite);
  const total = sortedThreeD.length + sortedBlackWhite.length;

  if (total === 0) {
    return [];
  }

  const result: Illustration[] = [];
  let threeDIndex = 0;
  let blackWhiteIndex = 0;
  let threeDError = 0;
  let blackWhiteError = 0;

  for (let i = 0; i < total; i++) {
    threeDError += sortedThreeD.length;
    blackWhiteError += sortedBlackWhite.length;

    if (
      threeDIndex < sortedThreeD.length &&
      (blackWhiteIndex >= sortedBlackWhite.length ||
        threeDError >= blackWhiteError)
    ) {
      result.push(sortedThreeD[threeDIndex]);
      threeDIndex += 1;
      threeDError -= total;
      continue;
    }

    if (blackWhiteIndex < sortedBlackWhite.length) {
      result.push(sortedBlackWhite[blackWhiteIndex]);
      blackWhiteIndex += 1;
      blackWhiteError -= total;
    }
  }

  return result;
}
