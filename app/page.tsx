import type { Metadata } from "next";
import { Suspense } from "react";
import { preload } from "react-dom";

import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { Gallery } from "@/components/Gallery/Gallery";
import {
  buildGalleryCatalog,
  getLcpGalleryIllustration,
} from "@/lib/filterIllustrations";
import { getIllustrations } from "@/lib/getIllustrations";
import { getPreviewAssetUrl } from "@/lib/previewAsset";
import {
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo/jsonLd";
import { buildHomeMetadata, buildPageMetadata } from "@/lib/seo/metadata";

interface HomePageProps {
  searchParams: Promise<{ filter?: string; q?: string; search?: string }>;
}

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() || params.search?.trim();

  if (query) {
    return buildPageMetadata({
      title: "Search Results",
      description: "Search InkMorph premium 3D icons, illustrations and wallpapers.",
      path: "/",
      noIndex: true,
    });
  }

  if (params.filter && params.filter !== "all") {
    return buildPageMetadata({
      title: "InkMorph Gallery",
      description:
        "Browse premium 3D icons, illustrations and creative assets on InkMorph.",
      path: "/",
      noIndex: true,
    });
  }

  return buildHomeMetadata();
}

export default function Home() {
  const galleryData = buildGalleryCatalog(getIllustrations());
  const lcpIllustration = getLcpGalleryIllustration(galleryData, "all");

  if (lcpIllustration) {
    preload(getPreviewAssetUrl(lcpIllustration, "grid"), {
      as: "image",
      fetchPriority: "high",
    });
  }

  return (
    <>
      <JsonLdScript
        data={[buildOrganizationJsonLd(), buildWebSiteJsonLd()]}
      />
      <Suspense fallback={null}>
        <Gallery galleryData={galleryData} />
      </Suspense>
    </>
  );
}
