export interface IconPack {
  id: string;
  title: string;
  description: string;
  thumbnailSrc: string;
  /** Optional availability callout shown beside the title (Figma 40004936:47820). */
  availabilityLabel?: string;
  /** Premium packs require purchase before opening. */
  premium?: boolean;
  /** Hidden packs stay out of the gallery until launched. */
  hidden?: boolean;
  /** Illustration filenames included in this pack (gallery assets). */
  illustrationFilenames: string[];
}

/** Build `001-icon01.png` style filenames for a consecutive icon range. */
export function buildIconPackFilenames(start: number, count: number): string[] {
  return Array.from({ length: count }, (_, index) => {
    const number = start + index;
    const padded = String(number).padStart(3, "0");
    const iconNum = String(number).padStart(2, "0");
    return `${padded}-icon${iconNum}.png`;
  });
}

/** Figma 40004878:12459 — Icon Packs gallery cards. */
export const ICON_PACKS: IconPack[] = [
  {
    id: "fuzzy-3d-icon-1",
    title: "Fuzzy 3D Icon Pack",
    description: "100 playful 3D icons with a soft, fuzzy finish.",
    thumbnailSrc: "/packs/fuzzy-3d-icon-1.png",
    illustrationFilenames: [],
  },
  {
    id: "stitched-leather-3d",
    title: "Stitched leather 3D",
    description:
      "Explore 100 unique Stitched-Leather 3D Icons to enhance your modern designs.",
    thumbnailSrc: "/packs/stitched-leather-3d.png",
    illustrationFilenames: [],
  },
  {
    id: "fuzzy-3d-icon-2",
    title: "Glossy 3D Icon Pack",
    description: "100 vibrant icons with a smooth, glossy 3D finish.",
    thumbnailSrc: "/packs/fuzzy-3d-icon-2.png",
    illustrationFilenames: [],
  },
  {
    id: "fuzzy-3d-icon-3",
    title: "Liquid 3D Icon Pack",
    description:
      "100 colorful icons with bold, fluid shapes and glossy surfaces.",
    thumbnailSrc: "/packs/fuzzy-3d-icon-3.png",
    illustrationFilenames: [],
  },
  {
    id: "fuzzy-3d-icon-4",
    title: "Neon Glass Icon Pack",
    description: "100 vibrant icons with a glowing glass-inspired finish.",
    thumbnailSrc: "/packs/fuzzy-3d-icon-4.png",
    illustrationFilenames: [],
  },
];

export function getVisibleIconPacks(): IconPack[] {
  return ICON_PACKS.filter((pack) => !pack.hidden);
}

export function getIconPackById(packId: string): IconPack | undefined {
  return ICON_PACKS.find((pack) => pack.id === packId);
}

/** Whether the current user can open this pack detail view. */
export function canAccessIconPack(
  pack: IconPack,
  hasPremiumAccess: boolean
): boolean {
  return !pack.premium || hasPremiumAccess;
}
