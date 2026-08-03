/** Microsoft Clarity project ID */
export const CLARITY_PROJECT_ID = "xwsyyik4ye";

/** Clarity runs only in production builds (not `next dev`). */
export function isClarityEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}
