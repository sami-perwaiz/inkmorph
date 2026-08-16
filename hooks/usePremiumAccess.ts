"use client";

import { useCallback, useEffect, useState } from "react";

import {
  AUTH_CHANGE_EVENT,
  hasPremiumAccess,
  PREMIUM_CHANGE_EVENT,
} from "@/lib/premiumAccess";

export function usePremiumAccess(): {
  hasPremiumAccess: boolean;
  isReady: boolean;
} {
  const [hasPremium, setHasPremium] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const sync = useCallback(() => {
    setHasPremium(hasPremiumAccess());
    setIsReady(true);
  }, []);

  useEffect(() => {
    sync();
    window.addEventListener(PREMIUM_CHANGE_EVENT, sync);
    window.addEventListener(AUTH_CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener(PREMIUM_CHANGE_EVENT, sync);
      window.removeEventListener(AUTH_CHANGE_EVENT, sync);
    };
  }, [sync]);

  return { hasPremiumAccess: hasPremium, isReady };
}
