"use client";

import type { ReactNode } from "react";

import { PremiumAccessProvider } from "@/components/PremiumAccessProvider/PremiumAccessProvider";

/** Site-wide providers — premium modal available on every page without navigation. */
export function AppProviders({ children }: { children: ReactNode }) {
  return <PremiumAccessProvider>{children}</PremiumAccessProvider>;
}
