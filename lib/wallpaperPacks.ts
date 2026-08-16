export interface WallpaperPack {
  id: string;
  title: string;
  author: string;
  /** Grid card mockup from Figma — do not use for download. */
  thumbnailSrc: string;
  /** Full-resolution portrait preview on the detail page. */
  previewSrc: string;
  /** Full-resolution file served on download. */
  downloadSrc: string;
  /** Premium sets require purchase before opening. */
  premium?: boolean;
}

/** Figma 40004961:8876 — iPhone Wallpapers tab grid. */
export const WALLPAPER_PACKS: WallpaperPack[] = [
  {
    id: "crimson-geometry",
    title: "Crimson Geometry",
    author: "Private Talky",
    thumbnailSrc: "/wallpapers/geometric-red.png",
    previewSrc: "/wallpapers/downloads/crimson-geometry.png",
    downloadSrc: "/wallpapers/downloads/crimson-geometry.png",
  },
  {
    id: "chrome-noir",
    title: "Chrome Noir",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/metallic-head.png",
    previewSrc: "/wallpapers/downloads/chrome-noir.png",
    downloadSrc: "/wallpapers/downloads/chrome-noir.png",
  },
  {
    id: "obsidian-orbit",
    title: "Obsidian Orbit",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/orange-rings.png",
    previewSrc: "/wallpapers/downloads/obsidian-orbit.png",
    downloadSrc: "/wallpapers/downloads/obsidian-orbit.png",
  },
  {
    id: "pastel-horizon",
    title: "Pastel Horizon",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/apple-wood.png",
    previewSrc: "/wallpapers/downloads/pastel-horizon.png",
    downloadSrc: "/wallpapers/downloads/pastel-horizon.png",
  },
  {
    id: "neon-pebbles",
    title: "Neon Pebbles",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/purple-stones.png",
    previewSrc: "/wallpapers/downloads/neon-pebbles.png",
    downloadSrc: "/wallpapers/downloads/neon-pebbles.png",
  },
  {
    id: "liquid-chrome",
    title: "Liquid Chrome",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/grey-stones.png",
    previewSrc: "/wallpapers/downloads/liquid-chrome.png",
    downloadSrc: "/wallpapers/downloads/liquid-chrome.png",
  },
  {
    id: "monochrome-motion",
    title: "Monochrome Motion",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/build-with-purpose.png",
    previewSrc: "/wallpapers/downloads/monochrome-motion.png",
    downloadSrc: "/wallpapers/downloads/monochrome-motion.png",
  },
  {
    id: "dreamscape-profile",
    title: "Dreamscape Profile",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/flare-gaze.png",
    previewSrc: "/wallpapers/downloads/dreamscape-profile.png",
    downloadSrc: "/wallpapers/downloads/dreamscape-profile.png",
  },
  {
    id: "mountain-solitude",
    title: "Mountain Solitude",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/flare-summit.png",
    previewSrc: "/wallpapers/downloads/mountain-solitude.png",
    downloadSrc: "/wallpapers/downloads/mountain-solitude.png",
  },
  {
    id: "azure-curves",
    title: "Azure Curves",
    author: "InkMorph Studio",
    thumbnailSrc: "/wallpapers/flare-prism.png",
    previewSrc: "/wallpapers/downloads/azure-curves.png",
    downloadSrc: "/wallpapers/downloads/azure-curves.png",
  },
];

export function getWallpaperPackById(
  packId: string
): WallpaperPack | undefined {
  return WALLPAPER_PACKS.find((pack) => pack.id === packId);
}

/** Legacy wallpaper routes from earlier releases. */
const LEGACY_WALLPAPER_IDS: Record<string, string> = {
  "geometric-red": "crimson-geometry",
  "metallic-head": "chrome-noir",
  "orange-rings": "obsidian-orbit",
  "apple-wood": "pastel-horizon",
  "purple-stones": "neon-pebbles",
  "grey-stones": "liquid-chrome",
  "build-with-purpose": "monochrome-motion",
  "flare-gaze": "dreamscape-profile",
  "flare-summit": "mountain-solitude",
  "flare-prism": "azure-curves",
};

export function resolveWallpaperPackId(packId: string): string {
  return LEGACY_WALLPAPER_IDS[packId] ?? packId;
}

export function canAccessWallpaperPack(
  pack: WallpaperPack,
  hasPremiumAccess: boolean
): boolean {
  return !pack.premium || hasPremiumAccess;
}

export function getWallpaperDownloadSrc(pack: WallpaperPack): string {
  return pack.downloadSrc;
}

export function getWallpaperDownloadFilename(pack: WallpaperPack): string {
  return `${pack.title}.png`;
}
