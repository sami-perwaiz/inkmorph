import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { preload } from "react-dom";

import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { Gallery } from "@/components/Gallery/Gallery";
import {
  getCategorySeoBySlug,
} from "@/lib/seo/categories";
import { buildBreadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isCategorySlug } from "@/lib/seo/routes";
import {
  buildGalleryCatalog,
  getLcpGalleryIllustration,
} from "@/lib/filterIllustrations";
import { getIllustrations } from "@/lib/getIllustrations";
import { getPreviewAssetUrl } from "@/lib/previewAsset";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return [
    { category: "avatars" },
    { category: "characters" },
    { category: "objects" },
    { category: "abstract" },
  ];
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const config = getCategorySeoBySlug(category);

  if (!config) {
    return { title: "Category" };
  }

  return buildPageMetadata({
    title: config.title,
    description: config.description,
    path: `/categories/${config.slug}`,
    keywords: config.keywords,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isCategorySlug(category)) {
    notFound();
  }

  const config = getCategorySeoBySlug(category);

  if (!config) {
    notFound();
  }

  const galleryData = buildGalleryCatalog(getIllustrations());
  const lcpIllustration = getLcpGalleryIllustration(
    galleryData,
    config.filter
  );

  if (lcpIllustration) {
    preload(getPreviewAssetUrl(lcpIllustration, "grid"), {
      as: "image",
      fetchPriority: "high",
    });
  }

  return (
    <>
      <JsonLdScript
        data={buildBreadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: config.heading, path: `/categories/${config.slug}` },
        ])}
      />
      <Suspense fallback={null}>
        <Gallery
          galleryData={galleryData}
          initialFilter={config.filter}
          seoIntro={config.intro}
        />
      </Suspense>
    </>
  );
}
