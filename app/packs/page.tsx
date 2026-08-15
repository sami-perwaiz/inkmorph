import type { Metadata } from "next";

import { IconPacksView } from "@/components/Packs/IconPacksView";

export const metadata: Metadata = {
  title: "Icon Packs",
  description:
    "Browse premium 3D icon packs from InkMorph — fuzzy icons, stitched leather sets, and more crafted for modern product design.",
};

export default function IconPacksPage() {
  return <IconPacksView />;
}
