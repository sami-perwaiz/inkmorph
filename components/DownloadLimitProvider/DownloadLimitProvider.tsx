"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { DailyDownloadLimitModal } from "@/components/DailyDownloadLimitModal/DailyDownloadLimitModal";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { trackDownloadLimitPopup } from "@/lib/analytics";
import {
  authorizeDownloadSlots,
  fetchDownloadLimitStatus,
  type DownloadLimitStatus,
} from "@/lib/downloadLimitApi";
import { DAILY_DOWNLOAD_LIMIT } from "@/lib/dailyDownloadReset";

export interface DownloadSlotsResult {
  ok: boolean;
  allowedCount: number;
}

interface DownloadLimitContextValue {
  status: DownloadLimitStatus | null;
  remaining: number;
  resetAt: number | null;
  refreshStatus: () => Promise<void>;
  requestDownloadSlots: (count: number) => Promise<DownloadSlotsResult>;
  showLimitModal: () => void;
}

const DownloadLimitContext = createContext<DownloadLimitContextValue | null>(
  null
);

export function DownloadLimitProvider({ children }: { children: ReactNode }) {
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const [status, setStatus] = useState<DownloadLimitStatus | null>(null);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const authorizeInFlightRef = useRef<Promise<DownloadSlotsResult> | null>(
    null
  );

  const refreshStatus = useCallback(async () => {
    const next = await fetchDownloadLimitStatus();
    setStatus(next);
    return;
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void refreshStatus();
  }, [isReady, hasPremiumAccess, refreshStatus]);

  const showLimitModal = useCallback(() => {
    void refreshStatus().finally(() => {
      setIsLimitOpen(true);
      trackDownloadLimitPopup();
    });
  }, [refreshStatus]);

  const requestDownloadSlots = useCallback(
    async (count: number): Promise<DownloadSlotsResult> => {
      const normalizedCount = Math.max(0, Math.floor(count));

      if (normalizedCount === 0) {
        return { ok: false, allowedCount: 0 };
      }

      if (hasPremiumAccess) {
        return { ok: true, allowedCount: normalizedCount };
      }

      if (authorizeInFlightRef.current) {
        return authorizeInFlightRef.current;
      }

      const pending = (async (): Promise<DownloadSlotsResult> => {
        const result = await authorizeDownloadSlots(normalizedCount);

        setStatus({
          limit: result.limit,
          used: result.used,
          remaining: result.remaining,
          resetAt: result.resetAt,
          isPremium: result.isPremium,
        });

        if (!result.authorized) {
          showLimitModal();
          return { ok: false, allowedCount: 0 };
        }

        return {
          ok: true,
          allowedCount: result.allowedCount,
        };
      })();

      authorizeInFlightRef.current = pending;

      try {
        return await pending;
      } finally {
        authorizeInFlightRef.current = null;
      }
    },
    [hasPremiumAccess, showLimitModal]
  );

  const handleResetComplete = useCallback(async () => {
    await refreshStatus();
    setIsLimitOpen(false);
  }, [refreshStatus]);

  const closeLimitModal = useCallback(() => {
    setIsLimitOpen(false);
  }, []);

  const remaining =
    hasPremiumAccess || status?.isPremium
      ? Number.POSITIVE_INFINITY
      : (status?.remaining ?? DAILY_DOWNLOAD_LIMIT);

  const resetAt = status?.resetAt ?? null;

  const value = useMemo(
    () => ({
      status,
      remaining,
      resetAt,
      refreshStatus,
      requestDownloadSlots,
      showLimitModal,
    }),
    [
      remaining,
      refreshStatus,
      requestDownloadSlots,
      resetAt,
      showLimitModal,
      status,
    ]
  );

  return (
    <DownloadLimitContext.Provider value={value}>
      {children}
      <DailyDownloadLimitModal
        open={isLimitOpen}
        resetAt={resetAt}
        remaining={status?.remaining ?? 0}
        limit={status?.limit ?? 3}
        onClose={closeLimitModal}
        onResetComplete={handleResetComplete}
      />
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
