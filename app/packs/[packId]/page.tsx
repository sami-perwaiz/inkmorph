import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreadcrumbNav } from "@/components/Seo/BreadcrumbNav";
import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { IconPackDetailGate } from "@/components/Packs/IconPackDetailGate";
import { IconPackDetailView } from "@/components/Packs/IconPackDetailView";
import { getIconPackById, getVisibleIconPacks } from "@/lib/iconPacks";
import { getPackIllustrations } from "@/lib/packIllustrations";
import {
  buildBreadcrumbJsonLd,
  buildPackCollectionJsonLd,
} from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import {
  buildPackSeoDescription,
  buildPackSeoTitle,
} from "@/lib/seo/packs";

interface PackDetailPageProps {
  params: Promise<{ packId: string }>;
}

export function generateStaticParams() {
  return getVisibleIconPacks().map((pack) => ({ packId: pack.id }));
}

export async function generateMetadata({
  params,
}: PackDetailPageProps): Promise<Metadata> {
  const { packId } = await params;
  const pack = getIconPackById(packId);

  if (!pack) {
    return { title: "Icon Pack" };
  }

  return buildPageMetadata({
    title: buildPackSeoTitle(pack),
    description: buildPackSeoDescription(pack),
    path: `/packs/${pack.id}`,
    ogImage: pack.thumbnailSrc,
    ogImageAlt: `${pack.title} 3D icon pack preview`,
    absoluteTitle: true,
    keywords: [
      pack.title,
      "3D icon pack",
      "premium 3D icons",
      "icon packs",
      "UI design resources",
    ],
  });
}

export default async function PackDetailPage({ params }: PackDetailPageProps) {
  const { packId } = await params;
  const pack = getIconPackById(packId);

  if (!pack || pack.hidden) {
    notFound();
  }

  const illustrations = getPackIllustrations(pack);
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Icon Packs", href: "/packs" },
    { label: pack.title },
  ];

  const jsonLd = [
    buildBreadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Icon Packs", path: "/packs" },
      { name: pack.title, path: `/packs/${pack.id}` },
    ]),
    buildPackCollectionJsonLd(pack),
  ];

  const content = pack.premium ? (
    <IconPackDetailGate pack={pack} illustrations={illustrations} />
  ) : (
    <IconPackDetailView pack={pack} illustrations={illustrations} />
  );

  return (
    <>
      <BreadcrumbNav items={breadcrumbs} />
      <JsonLdScript data={jsonLd} />
      {content}
    </>
  );
}
