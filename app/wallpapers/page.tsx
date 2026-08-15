import type { Metadata } from "next";

import { WallpapersView } from "@/components/Packs/WallpapersView";

export const metadata: Metadata = {
  title: "iPhone Wallpapers",
  description: "Premium iPhone wallpapers from InkMorph — coming soon.",
};

export default function WallpapersPage() {
  return <WallpapersView />;
}
