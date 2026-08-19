import { getAuthEntryHref, isSignedIn } from "@/lib/authSession";
import type { PricingPlan } from "@/lib/pricingPlans";

export interface PurchaseActionOptions {
  returnPath?: string;
  planId?: Exclude<PricingPlan["id"], "basic">;
}

export function getCheckoutHref(planId: Exclude<PricingPlan["id"], "basic">): string {
  return `/checkout?plan=${encodeURIComponent(planId)}`;
}

/**
 * Shared purchase / upgrade CTA handler.
 * Signed-out users → sign-in flow. Signed-in users → checkout (payment provider TBD).
 */
export function runPurchaseAction(options?: PurchaseActionOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isSignedIn()) {
    const planId = options?.planId ?? "full-pack";
    const returnPath =
      options?.returnPath ?? getCheckoutHref(planId);

    window.location.assign(getAuthEntryHref(returnPath));
    return;
  }

  const planId = options?.planId ?? "full-pack";
  window.location.assign(getCheckoutHref(planId));
}
