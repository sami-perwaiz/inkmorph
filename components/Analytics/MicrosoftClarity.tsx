import { isClarityEnabled } from "@/lib/clarityConfig";

import { MicrosoftClarityInit } from "./MicrosoftClarityInit";

/**
 * Official Microsoft Clarity loader (`@microsoft/clarity`).
 * Mounted only in production; initializes once after the page is interactive.
 */
export function MicrosoftClarity() {
  if (!isClarityEnabled()) {
    return null;
  }

  return <MicrosoftClarityInit />;
}
