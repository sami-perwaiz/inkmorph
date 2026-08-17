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
import { AUTH_CHANGE_EVENT, isSignedIn } from "@/lib/authSession";
import {
  authorizeDownloadSlots,
  fetchDownloadLimitStatus,
  syncSignedInDownloadSession,
  type DownloadLimitStatus,
} from "@/lib/downloadLimitApi";
import { ANONYMOUS_DAILY_ACTION_LIMIT } from "@/lib/dailyDownloadReset";

export interface ActionSlotsResult {
  ok: boolean;
  allowedCount: number;
}

interface DownloadLimitContextValue {
  status: DownloadLimitStatus | null;
  remaining: number;
  resetAt: number | null;
  refreshStatus: () => Promise<void>;
  /** Authorize shared Copy + Download actions (1 action = 1 slot). */
  requestActionSlots: (count: number) => Promise<ActionSlotsResult>;
  showLimitModal: () => void;
}

const DownloadLimitContext = createContext<DownloadLimitContextValue | null>(
  null
);

async function syncAuthSessions(): Promise<void> {
  await syncSignedInDownloadSession(isSignedIn());
}

export function DownloadLimitProvider({ children }: { children: ReactNode }) {
  const { hasPremiumAccess, isReady } = usePremiumAccess();
  const [status, setStatus] = useState<DownloadLimitStatus | null>(null);
  const [isLimitOpen, setIsLimitOpen] = useState(false);
  const authorizeInFlightRef = useRef<Promise<ActionSlotsResult> | null>(null);

  const refreshStatus = useCallback(async () => {
    const next = await fetchDownloadLimitStatus();
    setStatus(next);
  }, []);

  const syncSessionsAndRefresh = useCallback(async () => {
    await syncAuthSessions();
    await refreshStatus();
  }, [refreshStatus]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void syncSessionsAndRefresh();
  }, [isReady, hasPremiumAccess, syncSessionsAndRefresh]);

  useEffect(() => {
    const handleAuthChange = () => {
      void syncSessionsAndRefresh();
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, [syncSessionsAndRefresh]);

  const showLimitModal = useCallback(() => {
    void refreshStatus().finally(() => {
      setIsLimitOpen(true);
      trackDownloadLimitPopup();
    });
  }, [refreshStatus]);

  const requestActionSlots = useCallback(
    async (count: number): Promise<ActionSlotsResult> => {
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

      const pending = (async (): Promise<ActionSlotsResult> => {
        const result = await authorizeDownloadSlots(normalizedCount);

        setStatus({
          limit: result.limit,
          used: result.used,
          remaining: result.remaining,
          resetAt: result.resetAt,
          isPremium: result.isPremium,
          isSignedIn: result.isSignedIn,
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
    await syncSessionsAndRefresh();
    setIsLimitOpen(false);
  }, [syncSessionsAndRefresh]);

  const closeLimitModal = useCallback(() => {
    setIsLimitOpen(false);
  }, []);

  const remaining =
    hasPremiumAccess || status?.isPremium
      ? Number.POSITIVE_INFINITY
      : (status?.remaining ?? ANONYMOUS_DAILY_ACTION_LIMIT);

  const resetAt = status?.resetAt ?? null;

  const value = useMemo(
    () => ({
      status,
      remaining,
      resetAt,
      refreshStatus,
      requestActionSlots,
      showLimitModal,
    }),
    [
      remaining,
      refreshStatus,
      requestActionSlots,
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
        limit={status?.limit ?? ANONYMOUS_DAILY_ACTION_LIMIT}
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
