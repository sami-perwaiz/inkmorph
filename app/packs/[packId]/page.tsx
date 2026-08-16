import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconPackDetailGate } from "@/components/Packs/IconPackDetailGate";
import { getIconPackById } from "@/lib/iconPacks";
import { getPackIllustrations } from "@/lib/packIllustrations";

interface PackDetailPageProps {
  params: Promise<{ packId: string }>;
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

  return <IconPackDetailGate pack={pack} illustrations={illustrations} />;
}
