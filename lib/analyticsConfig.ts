/** GA4 Measurement ID */
export const GA_MEASUREMENT_ID = "G-D579BLW8QJ";

/** GA runs only in production builds (not `next dev`). */
export function isGaEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}
