import type { Metadata } from "next";

import { WallpapersView } from "@/components/Packs/WallpapersView";

export const metadata: Metadata = {
  title: "iPhone Wallpapers",
  description:
    "Browse premium iPhone wallpaper sets from InkMorph — lock screen and home screen previews crafted for modern devices.",
};

export default function WallpapersPage() {
  return <WallpapersView />;
}
