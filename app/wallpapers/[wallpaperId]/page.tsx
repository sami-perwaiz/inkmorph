import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WallpaperDetailGate } from "@/components/Packs/WallpaperDetailGate";
import {
  getWallpaperPackById,
  resolveWallpaperPackId,
} from "@/lib/wallpaperPacks";

interface WallpaperDetailPageProps {
  params: Promise<{ wallpaperId: string }>;
}

export async function generateMetadata({
  params,
}: WallpaperDetailPageProps): Promise<Metadata> {
  const { wallpaperId } = await params;
  const pack = getWallpaperPackById(resolveWallpaperPackId(wallpaperId));

  if (!pack) {
    return { title: "iPhone Wallpaper" };
  }

  return {
    title: pack.title,
    description: `${pack.title} iPhone wallpaper set from InkMorph.`,
  };
}

export default async function WallpaperDetailPage({
  params,
}: WallpaperDetailPageProps) {
  const { wallpaperId } = await params;
  const pack = getWallpaperPackById(resolveWallpaperPackId(wallpaperId));

  if (!pack) {
    notFound();
  }

  return <WallpaperDetailGate pack={pack} />;
}
