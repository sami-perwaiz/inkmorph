"use client";

import type { ReactNode } from "react";

import { DownloadLimitProvider } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { AuthStorageReset } from "@/components/AuthStorageReset/AuthStorageReset";
import { PremiumAccessProvider } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { ScrollRestoration } from "@/components/ScrollRestoration/ScrollRestoration";

/** Site-wide providers — premium modal and download limits on every page. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthStorageReset />
      <PremiumAccessProvider>
        <DownloadLimitProvider>
          <ScrollRestoration />
          {children}
        </DownloadLimitProvider>
      </PremiumAccessProvider>
    </>
  );
}
