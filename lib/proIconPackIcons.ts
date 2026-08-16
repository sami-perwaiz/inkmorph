import type { Illustration } from "@/types/illustration";

export const PRO_ICON_PACK_ASSET_VERSION = "20260817-1";

interface ProIconPackConfig {
  packId: string;
  iconIdPrefix: string;
  downloadPrefix: string;
  displayName: string;
}

const PRO_ICON_PACK_CONFIGS: Record<string, ProIconPackConfig> = {
  "fuzzy-3d-icon-1": {
    packId: "fuzzy-3d-icon-1",
    iconIdPrefix: "FZ3D",
    downloadPrefix: "im-fz3d",
    displayName: "Fuzzy 3D",
  },
  "fuzzy-3d-icon-2": {
    packId: "fuzzy-3d-icon-2",
    iconIdPrefix: "GL3D",
    downloadPrefix: "im-gl3d",
    displayName: "Glossy 3D",
  },
  "fuzzy-3d-icon-3": {
    packId: "fuzzy-3d-icon-3",
    iconIdPrefix: "LQ3D",
    downloadPrefix: "im-lq3d",
    displayName: "Liquid 3D",
  },
  "fuzzy-3d-icon-4": {
    packId: "fuzzy-3d-icon-4",
    iconIdPrefix: "NG3D",
    downloadPrefix: "im-ng3d",
    displayName: "Neon Glass 3D",
  },
};

export const PRO_ICON_PACK_IDS = Object.keys(PRO_ICON_PACK_CONFIGS);

export function isProIconPack(packId: string): boolean {
  return packId in PRO_ICON_PACK_CONFIGS;
}

/** 100 icons per pack — files live under `/public/packs/{id}/icons/`. */
export function getProIconPackIllustrations(packId: string): Illustration[] {
  const config = PRO_ICON_PACK_CONFIGS[packId];
  if (!config) {
    return [];
  }

  return Array.from({ length: 100 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const downloadId = String(index + 1).padStart(3, "0");
    const name = `${config.displayName} ${number}`;

    return {
      id: `${config.iconIdPrefix}-${number}`,
      category: "3d-icon",
      src: `/packs/${config.packId}/icons/${number}.png?v=${PRO_ICON_PACK_ASSET_VERSION}`,
      filename: `${config.downloadPrefix}-${downloadId}.png`,
      alt: `${name} 3D icon`,
      name,
    };
  });
}
