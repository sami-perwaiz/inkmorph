import type { Metadata } from "next";

import { LegalPageLayout } from "@/components/LegalPage/LegalPageLayout";
import type { LegalSection } from "@/components/LegalPage/legalPageTypes";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "License — InkMorph",
  description:
    "Learn how InkMorph 3D icons, illustrations, wallpapers, and creative assets can be used under the InkMorph license.",
  path: "/license",
  absoluteTitle: true,
});

const SECTIONS: readonly LegalSection[] = [
  {
    title: "Overview",
    paragraphs: [
      "InkMorph provides digital assets including 3D icons, illustrations, wallpapers, icon packs, and other creative resources. Your usage rights depend on the asset and the plan under which you access it.",
      "By downloading or using an InkMorph asset, you agree to follow the terms of this license.",
    ],
  },
  {
    title: "Free Assets",
    paragraphs: ["Free assets may be used for:"],
    list: [
      "Personal projects",
      "Personal websites and portfolios",
      "Social media content",
      "Presentations and mockups",
      "Design concepts and prototypes",
    ],
    secondaryHeading: "Free assets may not be:",
    secondaryList: [
      "Resold as standalone files",
      "Redistributed or uploaded to another asset library",
      "Packaged and sold as a competing resource",
      "Claimed as your own original artwork",
      "Used to create a competing icon or asset library",
    ],
  },
  {
    title: "Premium Assets",
    paragraphs: [
      "Premium assets are available to users with the appropriate paid plan.",
      "Premium assets may be used in:",
    ],
    list: [
      "Commercial websites",
      "Mobile and desktop applications",
      "SaaS products",
      "Marketing materials",
      "Social media content",
      "Presentations",
      "Client projects",
      "Personal and commercial design projects",
    ],
    trailingParagraphs: [
      "You may modify, resize, recolor, or incorporate premium assets into your own designs and products.",
      "However, the original asset files may not be redistributed, resold, shared, or made available for download as standalone assets.",
    ],
  },
  {
    title: "Wallpapers",
    paragraphs: ["InkMorph wallpapers may be used as:"],
    list: [
      "Personal device wallpapers",
      "Desktop backgrounds",
      "Personal visual content",
    ],
    trailingParagraphs: [
      "Wallpapers may not be redistributed or sold as standalone files.",
    ],
  },
  {
    title: "Attribution",
    paragraphs: [
      "Attribution is not required unless a specific asset or license explicitly states otherwise.",
    ],
  },
  {
    title: "Ownership",
    paragraphs: [
      "InkMorph and its creators retain ownership of the original assets.",
      "Downloading an asset does not transfer ownership or copyright of the original artwork to you.",
    ],
  },
  {
    title: "Prohibited Use",
    paragraphs: ["You may not use InkMorph assets to:"],
    list: [
      "Create a competing asset marketplace or library",
      "Resell individual assets",
      "Redistribute original files",
      "Claim the original artwork as your own",
      "Use assets in unlawful, fraudulent, or harmful content",
    ],
  },
  {
    title: "License Changes",
    paragraphs: [
      "InkMorph may update this license when necessary. The version available on this page applies to assets downloaded under that license.",
    ],
  },
  {
    title: "Questions",
    paragraphs: [
      "If you have questions about how an asset can be used, contact the InkMorph team before using it commercially.",
    ],
    contactEmail: true,
  },
];

export default function LicensePage() {
  return (
    <LegalPageLayout
      title="License"
      subtitle="Simple, clear licensing for every InkMorph asset."
      sections={SECTIONS}
    />
  );
}
