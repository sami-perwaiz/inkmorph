import { getIllustrations } from "@/lib/getIllustrations";
import type { IconPack } from "@/lib/iconPacks";
import {
  getProIconPackIllustrations,
  isProIconPack,
} from "@/lib/proIconPackIcons";
import { getStitchedLeatherPackIllustrations } from "@/lib/stitchedLeatherPackIcons";
import type { Illustration } from "@/types/illustration";

export function getPackIllustrations(pack: IconPack): Illustration[] {
  if (pack.id === "stitched-leather-3d") {
    return getStitchedLeatherPackIllustrations();
  }

  if (isProIconPack(pack.id)) {
    return getProIconPackIllustrations(pack.id);
  }

  const byFilename = new Map(
    getIllustrations().map((item) => [item.storageFilename ?? item.filename, item])
  );

  return pack.illustrationFilenames
    .map((filename) => byFilename.get(filename))
    .filter((item): item is Illustration => Boolean(item));
}
