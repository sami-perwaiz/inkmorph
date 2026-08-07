import type { Metadata } from "next";

import { PricingView } from "@/components/Pricing/PricingView";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose InkMorph Basic or Pro. Start free with daily credits or unlock unlimited downloads, transparent PNG exports, and the full 3D illustration library.",
};

export default function PricingPage() {
  return <PricingView />;
}
