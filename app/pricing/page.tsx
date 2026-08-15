import type { Metadata } from "next";

import { PricingView } from "@/components/Pricing/PricingView";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose InkMorph Basic, Full Pack, or Lifetime. Start free with daily credits or unlock the complete 3D illustration library with a one-time purchase.",
};

export default function PricingPage() {
  return <PricingView />;
}
