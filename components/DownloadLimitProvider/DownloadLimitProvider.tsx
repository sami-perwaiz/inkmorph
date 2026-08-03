"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DailyDownloadLimitModal } from "@/components/DailyDownloadLimitModal/DailyDownloadLimitModal";
import {
  canDownloadToday,
  recordSuccessfulDownload,
} from "@/lib/dailyDownloadLimit";

interface DownloadLimitContextValue {
  /** Returns false when the daily limit is reached (and opens the popup). */
  requestDownloadSlot: () => boolean;
  /** Call after a download completes successfully. */
  commitDownloadSlot: () => void;
}

const DownloadLimitContext = createContext<DownloadLimitContextValue | null>(
  null
);

export function DownloadLimitProvider({ children }: { children: ReactNode }) {
  const [isLimitOpen, setIsLimitOpen] = useState(false);

  const requestDownloadSlot = useCallback(() => {
    if (!canDownloadToday()) {
      setIsLimitOpen(true);
      return false;
    }

    return true;
  }, []);

  const commitDownloadSlot = useCallback(() => {
    recordSuccessfulDownload();
  }, []);

  const closeLimitModal = useCallback(() => {
    setIsLimitOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      requestDownloadSlot,
      commitDownloadSlot,
    }),
    [commitDownloadSlot, requestDownloadSlot]
  );

  return (
    <DownloadLimitContext.Provider value={value}>
      {children}
      <DailyDownloadLimitModal open={isLimitOpen} onClose={closeLimitModal} />
    </DownloadLimitContext.Provider>
  );
}

export function useDownloadLimit(): DownloadLimitContextValue {
  const context = useContext(DownloadLimitContext);

  if (!context) {
    throw new Error(
      "useDownloadLimit must be used within DownloadLimitProvider."
    );
  }

  return context;
}
