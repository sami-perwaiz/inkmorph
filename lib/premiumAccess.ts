import { getAuthUser } from "@/lib/authSession";
import { getMockPurchase } from "@/lib/mockCheckout";

export const PREMIUM_CHANGE_EVENT = "inkmorph-premium-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** True when the signed-in user has premium from a completed mock purchase. */
export function hasPremiumAccess(): boolean {
  if (!isBrowser() || !getAuthUser()) {
    return false;
  }

  return getMockPurchase() !== null;
}

/** Dispatched after mock checkout completion; real providers should call this too. */
export function grantPremiumAccess(): void {
  notifyPremiumChange();
}

function notifyPremiumChange(): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(PREMIUM_CHANGE_EVENT));
}

export { AUTH_CHANGE_EVENT } from "@/lib/authSession";
