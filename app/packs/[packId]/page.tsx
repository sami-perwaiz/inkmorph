import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconPackDetailGate } from "@/components/Packs/IconPackDetailGate";
import { IconPackDetailView } from "@/components/Packs/IconPackDetailView";
import { getIconPackById, getVisibleIconPacks } from "@/lib/iconPacks";
import { getPackIllustrations } from "@/lib/packIllustrations";

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

  return {
    title: pack.title,
    description: pack.description,
  };
}

export default async function PackDetailPage({ params }: PackDetailPageProps) {
  const { packId } = await params;
  const pack = getIconPackById(packId);

  if (!pack || pack.hidden) {
    notFound();
  }

  const illustrations = getPackIllustrations(pack);

  if (pack.premium) {
    return <IconPackDetailGate pack={pack} illustrations={illustrations} />;
  }

  return <IconPackDetailView pack={pack} illustrations={illustrations} />;
}
