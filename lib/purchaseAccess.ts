import { getAuthEntryHref, isSignedIn } from "@/lib/authSession";

export interface PurchaseActionOptions {
  returnPath?: string;
}

/**
 * Shared purchase / upgrade CTA handler.
 * Signed-out users → sign-in flow. Signed-in users → no purchase until checkout ships.
 */
export function runPurchaseAction(options?: PurchaseActionOptions): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!isSignedIn()) {
    const returnPath =
      options?.returnPath ??
      (window.location.pathname + window.location.search + window.location.hash);

    window.location.assign(getAuthEntryHref(returnPath));
    return;
  }

  // Checkout not live — keep UI, do not grant premium or complete a purchase.
}
