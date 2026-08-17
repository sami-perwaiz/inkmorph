"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import {
  canUseHistoryBack,
  lockScrollPersistence,
  markLegalBackNavigation,
  savePageState,
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
    lockScrollPersistence();
    savePageState(window.location.pathname, { scrollY: window.scrollY });
    markLegalBackNavigation();

    if (canUseHistoryBack()) {
      window.history.back();
      return;
    }

    router.push(fallbackHref);
  }, [fallbackHref, router]);
}
