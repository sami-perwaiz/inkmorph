import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbNav } from "@/components/Seo/BreadcrumbNav";
import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { WallpaperDetailGate } from "@/components/Packs/WallpaperDetailGate";
import {
  getWallpaperPackById,
  resolveWallpaperPackId,
} from "@/lib/wallpaperPacks";
import {
  buildBreadcrumbJsonLd,
  buildWallpaperImageJsonLd,
} from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildWallpaperImageAlt,
  buildWallpaperSeoDescription,
  buildWallpaperSeoTitle,
} from "@/lib/seo/wallpapers";

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

  return buildPageMetadata({
    title: buildWallpaperSeoTitle(pack),
    description: buildWallpaperSeoDescription(pack),
    path: `/wallpapers/${pack.id}`,
    ogImage: pack.thumbnailSrc,
    ogImageAlt: buildWallpaperImageAlt(pack),
    absoluteTitle: true,
    keywords: [
      pack.title,
      "iPhone wallpaper",
      "mobile wallpaper",
      "3D wallpaper",
      "premium wallpaper",
    ],
  });
}

export default async function WallpaperDetailPage({
  params,
}: WallpaperDetailPageProps) {
  const { wallpaperId } = await params;
  const pack = getWallpaperPackById(resolveWallpaperPackId(wallpaperId));

  if (!pack) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Wallpapers", href: "/wallpapers" },
    { label: pack.title },
  ];

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Wallpapers", path: "/wallpapers" },
      { name: pack.title, path: `/wallpapers/${pack.id}` },
    ]),
    buildWallpaperImageJsonLd(pack),
  ];

  return (
    <>
      <BreadcrumbNav items={breadcrumbs} />
      <JsonLdScript data={jsonLd} />
      <WallpaperDetailGate pack={pack} />
    </>
  );
}
