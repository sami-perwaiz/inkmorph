import type { Metadata } from "next";

import { JsonLdScript } from "@/components/Seo/JsonLdScript";
import { PricingView } from "@/components/Pricing/PricingView";
import { buildPricingJsonLd } from "@/lib/seo/jsonLd";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing",
  description:
    "Choose InkMorph Basic, Full Pack, or Lifetime. Start free with daily credits or unlock the complete 3D illustration library with a one-time purchase.",
  path: "/pricing",
  keywords: [
    "InkMorph pricing",
    "premium 3D icons",
    "3D asset subscription",
    "design asset pricing",
    "icon pack pricing",
  ],
});

export default function PricingPage() {
  return (
    <>
      <JsonLdScript data={buildPricingJsonLd()} />
      <PricingView />
    </>
  );
}
