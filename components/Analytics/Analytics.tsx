import { GoogleAnalytics as NextGoogleAnalytics } from "@next/third-parties/google";

import { GA_MEASUREMENT_ID, isGaEnabled } from "@/lib/analyticsConfig";

/**
 * Official Next.js GA4 loader (`@next/third-parties`).
 * Scripts load after hydration (`afterInteractive`) and only in production.
 */
export function Analytics() {
  if (!isGaEnabled()) {
    return null;
  }

  return (
    <NextGoogleAnalytics
      gaId={GA_MEASUREMENT_ID}
      debugMode={process.env.NEXT_PUBLIC_GA_DEBUG === "true"}
    />
  );
}
