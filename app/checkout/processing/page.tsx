import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutProcessingScreen } from "@/components/Checkout/CheckoutProcessingScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Processing Payment",
  "Your InkMorph payment is being processed securely.",
  "/checkout/processing"
);

export default function CheckoutProcessingPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutProcessingScreen />
    </Suspense>
  );
}
