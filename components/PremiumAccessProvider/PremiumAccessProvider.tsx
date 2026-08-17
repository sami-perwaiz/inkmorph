"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  AUTH_CHANGE_EVENT,
  hasPremiumAccess,
  PREMIUM_CHANGE_EVENT,
} from "@/lib/premiumAccess";
import { syncPremiumDownloadSession } from "@/lib/downloadLimitApi";
import { runPurchaseAction } from "@/lib/testingPremiumAccess";

interface PremiumAccessContextValue {
  /** Opens the site-wide Purchase Pro modal — never navigates away. */
  requestPremiumAccess: () => void;
}

export interface PremiumAccessStateValue {
  hasPremiumAccess: boolean;
  isReady: boolean;
}

const PremiumAccessContext = createContext<PremiumAccessContextValue | null>(
  null
);

export const PremiumAccessStateContext =
  createContext<PremiumAccessStateValue | null>(null);

function readPremiumAccessSync(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return hasPremiumAccess();
}

export function PremiumAccessProvider({ children }: { children: ReactNode }) {
  const [hasPremium, setHasPremium] = useState(readPremiumAccessSync);
  const [isReady, setIsReady] = useState(
    () => typeof window !== "undefined"
  );

  const syncPremiumState = useCallback(() => {
    const next = hasPremiumAccess();
    setHasPremium(next);
    setIsReady(true);
    void syncPremiumDownloadSession(next);
  }, []);

  useEffect(() => {
    syncPremiumState();
    window.addEventListener(PREMIUM_CHANGE_EVENT, syncPremiumState);
    window.addEventListener(AUTH_CHANGE_EVENT, syncPremiumState);
    return () => {
      window.removeEventListener(PREMIUM_CHANGE_EVENT, syncPremiumState);
      window.removeEventListener(AUTH_CHANGE_EVENT, syncPremiumState);
    };
  }, [syncPremiumState]);

  const requestPremiumAccess = useCallback(() => {
    runPurchaseAction();
  }, []);

  const gateValue = useMemo(
    () => ({ requestPremiumAccess }),
    [requestPremiumAccess]
  );

  const stateValue = useMemo(
    () => ({ hasPremiumAccess: hasPremium, isReady }),
    [hasPremium, isReady]
  );

  return (
    <PremiumAccessStateContext.Provider value={stateValue}>
      <PremiumAccessContext.Provider value={gateValue}>
        {children}
      </PremiumAccessContext.Provider>
    </PremiumAccessStateContext.Provider>
  );
}

export function usePremiumAccessGate(): PremiumAccessContextValue {
  const context = useContext(PremiumAccessContext);

  if (!context) {
    throw new Error(
      "usePremiumAccessGate must be used within PremiumAccessProvider."
    );
  }

  return context;
}
