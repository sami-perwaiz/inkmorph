import type { Metadata } from "next";

import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { IconPacksView } from "@/components/Packs/IconPacksView";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Premium 3D Icon Packs",
  description:
    "Browse premium 3D icon packs from InkMorph — fuzzy icons, stitched leather sets, glossy icons and more crafted for modern product design.",
  path: "/packs",
  keywords: [
    "3D icon packs",
    "premium 3D icons",
    "icon packs",
    "UI icons",
    "design assets",
    "InkMorph packs",
  ],
});

export default function IconPacksPage() {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Premium 3D Icon Packs",
          description:
            "Browse premium 3D icon packs from InkMorph for modern interfaces and digital products.",
          url: absoluteUrl("/packs"),
        }}
      />
      <IconPacksView />
    </>
  );
}
