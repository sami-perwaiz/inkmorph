import { getCanonicalAssetUrl } from "@/lib/canonicalAsset";
import type { Illustration } from "@/types/illustration";

/**
 * Stitched Leather Icon Pack — sourced only from
 * `Stitched Leather Icon Pack/Stitched-leather 3D NN.png` (100 files).
 * Copied to `/public/packs/stitched-leather-3d/icons/NN.png`.
 */
export const STITCHED_LEATHER_ICON_COUNT = 100;

/** Bust cached Figma exports when serving pack icons. */
export const STITCHED_LEATHER_ASSET_VERSION = "20260816-44";

function stitchedLeatherIconName(number: string): string {
  return `Stitched-leather 3D ${number}`;
}

function stitchedLeatherDownloadFilename(index: number): string {
  const id = String(index + 1).padStart(3, "0");
  return `im-sl3d-${id}.png`;
}

export function getStitchedLeatherPackIllustrations(): Illustration[] {
  return Array.from({ length: STITCHED_LEATHER_ICON_COUNT }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const name = stitchedLeatherIconName(number);

    const filename = stitchedLeatherDownloadFilename(index);

    return {
      id: `SL3D-${number}`,
      category: "3d-icon",
      filename,
      alt: `${name} stitched leather 3D icon`,
      name,
      src: getCanonicalAssetUrl({ id: `SL3D-${number}`, filename }),
    };
  });
}
