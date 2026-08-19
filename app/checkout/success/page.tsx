import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutSuccessScreen } from "@/components/Checkout/CheckoutSuccessScreen";
import { buildPrivatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPrivatePageMetadata(
  "Payment Successful",
  "Your InkMorph purchase was completed successfully.",
  "/checkout/success"
);

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessScreen />
    </Suspense>
  );
}
