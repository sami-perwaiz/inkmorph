/** Temporary testing config — remove when real checkout is live. */
export const TESTING_PREMIUM_EMAIL = "paksam2131@gmail.com" as const;

/** True only for the designated testing account (exact email match). */
export function isTestingPremiumUser(
  email: string | null | undefined
): boolean {
  return email === TESTING_PREMIUM_EMAIL;
}

/** Purchase / upgrade CTAs are inert until checkout ships. */
export function runPurchaseAction(): void {
  // intentionally empty
}
