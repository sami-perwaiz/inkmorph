"use client";

import type { ReactNode } from "react";

import { DownloadLimitProvider } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { PremiumAccessProvider } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { ScrollRestoration } from "@/components/ScrollRestoration/ScrollRestoration";

/** Site-wide providers — premium modal and download limits on every page. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PremiumAccessProvider>
      <DownloadLimitProvider>
        <ScrollRestoration />
        {children}
      </DownloadLimitProvider>
    </PremiumAccessProvider>
  );
}
