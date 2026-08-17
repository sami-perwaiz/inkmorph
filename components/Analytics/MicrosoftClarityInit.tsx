"use client";

import { useEffect } from "react";

import { CLARITY_PROJECT_ID } from "@/lib/clarityConfig";

/**
 * Initializes Microsoft Clarity after the page is interactive so analytics
 * does not compete with first paint on mobile or slow connections.
 */
export function MicrosoftClarityInit() {
  useEffect(() => {
    const init = async () => {
      const { default: Clarity } = await import("@microsoft/clarity");
      Clarity.init(CLARITY_PROJECT_ID);
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(() => {
        void init();
      }, { timeout: 4000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(() => {
      void init();
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
}
