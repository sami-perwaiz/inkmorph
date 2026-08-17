import type { Metadata } from "next";

import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { WallpapersView } from "@/components/Packs/WallpapersView";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Premium iPhone Wallpapers",
  description:
    "Browse premium iPhone wallpaper sets from InkMorph — geometric, abstract and modern mobile wallpapers crafted for lock screen and home screen.",
  path: "/wallpapers",
  keywords: [
    "iPhone wallpapers",
    "mobile wallpapers",
    "premium wallpapers",
    "3D wallpapers",
    "phone backgrounds",
    "InkMorph wallpapers",
  ],
});

export default function WallpapersPage() {
  return (
    <>
      <JsonLdScript
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Premium iPhone Wallpapers",
          description:
            "Browse premium iPhone wallpaper sets from InkMorph for modern mobile devices.",
          url: absoluteUrl("/wallpapers"),
        }}
      />
      <WallpapersView />
    </>
  );
}
