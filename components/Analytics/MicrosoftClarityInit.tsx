"use client";

import Clarity from "@microsoft/clarity";
import { useEffect } from "react";

import { CLARITY_PROJECT_ID } from "@/lib/clarityConfig";

/**
 * Initializes the official `@microsoft/clarity` SDK once after hydration.
 * Duplicate script tags are also guarded inside the Clarity package.
 */
export function MicrosoftClarityInit() {
  useEffect(() => {
    Clarity.init(CLARITY_PROJECT_ID);
  }, []);

  return null;
}
