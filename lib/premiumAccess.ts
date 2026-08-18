import { AUTH_CHANGE_EVENT, getAuthUser } from "@/lib/authSession";

export const PREMIUM_CHANGE_EVENT = "inkmorph-premium-change";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/** True when the signed-in user has premium from a completed purchase. */
export function hasPremiumAccess(): boolean {
  if (!isBrowser() || !getAuthUser()) {
    return false;
  }

  // Checkout not live — no premium grants until real payment integration ships.
  return false;
}

/** Reserved for checkout completion — intentionally inert until payment ships. */
export function grantPremiumAccess(): void {
  // No-op until checkout integration grants access.
}

export { AUTH_CHANGE_EVENT };
