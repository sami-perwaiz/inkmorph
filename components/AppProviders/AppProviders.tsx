"use client";

import type { ReactNode } from "react";

import { DownloadLimitProvider } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { PremiumAccessProvider } from "@/components/PremiumAccessProvider/PremiumAccessProvider";

/** Site-wide providers — premium modal and download limits on every page. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PremiumAccessProvider>
      <DownloadLimitProvider>{children}</DownloadLimitProvider>
    </PremiumAccessProvider>
  );
}
