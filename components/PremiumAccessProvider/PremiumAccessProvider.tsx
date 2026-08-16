"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { PurchaseProModal } from "@/components/Packs/PurchaseProModal";

interface PremiumAccessContextValue {
  /** Opens the site-wide Purchase Pro modal — never navigates away. */
  requestPremiumAccess: () => void;
}

const PremiumAccessContext = createContext<PremiumAccessContextValue | null>(
  null
);

export function PremiumAccessProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const requestPremiumAccess = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({ requestPremiumAccess }),
    [requestPremiumAccess]
  );

  return (
    <PremiumAccessContext.Provider value={value}>
      {children}
      <PurchaseProModal open={isOpen} onClose={close} />
    </PremiumAccessContext.Provider>
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
