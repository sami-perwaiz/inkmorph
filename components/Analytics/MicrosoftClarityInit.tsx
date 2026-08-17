"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

import { CLARITY_PROJECT_ID } from "@/lib/clarityConfig";

/**
 * Initializes Microsoft Clarity after the page is interactive so analytics
 * does not compete with first paint on mobile or slow connections.
 */
export function MicrosoftClarityInit() {
  useEffect(() => {
    const init = () => {
      Clarity.init(CLARITY_PROJECT_ID);
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(init, { timeout: 4000 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = setTimeout(init, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  return null;
}
