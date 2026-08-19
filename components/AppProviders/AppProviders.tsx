"use client";

import type { ReactNode } from "react";

import { DownloadLimitProvider } from "@/components/DownloadLimitProvider/DownloadLimitProvider";
import { AuthStorageReset } from "@/components/AuthStorageReset/AuthStorageReset";
import { FirebaseAuthProvider } from "@/components/FirebaseAuthProvider/FirebaseAuthProvider";
import { PremiumAccessProvider } from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import { ScrollRestoration } from "@/components/ScrollRestoration/ScrollRestoration";

/** Site-wide providers — premium modal and download limits on every page. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthStorageReset />
      <FirebaseAuthProvider>
        <PremiumAccessProvider>
        <DownloadLimitProvider>
          <ScrollRestoration />
          {children}
        </DownloadLimitProvider>
      </PremiumAccessProvider>
      </FirebaseAuthProvider>
    </>
  );
}
