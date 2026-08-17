"use client";

import { useCallback, useContext, useEffect, useState } from "react";

import {
  PremiumAccessStateContext,
} from "@/components/PremiumAccessProvider/PremiumAccessProvider";
import {
  AUTH_CHANGE_EVENT,
  hasPremiumAccess,
  PREMIUM_CHANGE_EVENT,
} from "@/lib/premiumAccess";

function readPremiumAccessSync(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return hasPremiumAccess();
}

/** Reads premium access from the shared provider when available. */
export function usePremiumAccess(): {
  hasPremiumAccess: boolean;
  isReady: boolean;
} {
  const shared = useContext(PremiumAccessStateContext);

  const [hasPremium, setHasPremium] = useState(readPremiumAccessSync);
  const [isReady, setIsReady] = useState(
    () => typeof window !== "undefined"
  );

  const sync = useCallback(() => {
    setHasPremium(hasPremiumAccess());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (shared) {
      return;
    }

    sync();
    window.addEventListener(PREMIUM_CHANGE_EVENT, sync);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(PREMIUM_CHANGE_EVENT, sync);
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    };
  }, [shared, sync]);

  if (shared) {
    return shared;
  }

  return { hasPremiumAccess: hasPremium, isReady };
}
