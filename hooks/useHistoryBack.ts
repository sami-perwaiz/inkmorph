"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  canUseHistoryBack,
  markLegalBackNavigation,
  savePageScroll,
} from "@/lib/legalScroll";

interface UseHistoryBackOptions {
  fallbackHref?: string;
}

/** Browser-history back with homepage fallback for direct legal-page entry. */
export function useHistoryBack({
  fallbackHref = "/",
}: UseHistoryBackOptions = {}) {
  const router = useRouter();

  return useCallback(() => {
    savePageScroll(window.location.pathname);
    markLegalBackNavigation();

    if (canUseHistoryBack()) {
      window.history.back();
      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, router]);
}
