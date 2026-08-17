import type { WallpaperPack } from "@/lib/wallpaperPacks";

export function buildWallpaperSeoTitle(pack: WallpaperPack): string {
  return `${pack.title} Wallpaper — InkMorph`;
}

export function buildWallpaperSeoDescription(pack: WallpaperPack): string {
  return `Download ${pack.title}, a premium iPhone wallpaper by ${pack.author}. Explore high-quality mobile wallpapers and creative design assets on InkMorph.`;
}

export function buildWallpaperImageAlt(pack: WallpaperPack): string {
  return `${pack.title} iPhone wallpaper preview`;
}
