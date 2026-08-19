import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutScreen } from "@/components/Checkout/CheckoutScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Checkout",
  "Complete your InkMorph purchase securely.",
  "/checkout"
);

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutScreen />
    </Suspense>
  );
}
