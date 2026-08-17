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

import {
  DailyDownloadLimitModal,
  type LimitModalVariant,
  type PartialLimitReason,
} from "@/components/DailyDownloadLimitModal/DailyDownloadLimitModal";
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
  remaining: number;
}

interface DownloadLimitContextValue {
  status: DownloadLimitStatus | null;
  /** False until the server-backed allowance has been fetched at least once. */
  isStatusReady: boolean;
  remaining: number;
  resetAt: number | null;
  refreshStatus: () => Promise<DownloadLimitStatus | null>;
  /** Consume shared Copy + Download credits after a successful action. */
  requestActionSlots: (count: number) => Promise<ActionSlotsResult>;
  /** Timer popup — only when remaining credits are zero. */
  showExhaustedLimitModal: () => void;
  /** Credits-remaining message — when user still has credits but hits selection cap. */
  showPartialLimitModal: (
    remainingCount: number,
    reason?: PartialLimitReason
  ) => void;
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
  const [limitModalVariant, setLimitModalVariant] =
    useState<LimitModalVariant>("exhausted");
  const [partialRemaining, setPartialRemaining] = useState(0);
  const [partialReason, setPartialReason] =
    useState<PartialLimitReason>("remaining");
  const authorizeInFlightRef = useRef<Promise<ActionSlotsResult> | null>(null);

  const refreshStatus = useCallback(async (): Promise<DownloadLimitStatus | null> => {
    const next = await fetchDownloadLimitStatus();
    setStatus(next);
    return next;
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshStatus]);

  const showExhaustedLimitModal = useCallback(() => {
    void refreshStatus().finally(() => {
      setLimitModalVariant("exhausted");
      setIsLimitOpen(true);
      trackDownloadLimitPopup();
    });
  }, [refreshStatus]);

  const showPartialLimitModal = useCallback(
    (remainingCount: number, reason: PartialLimitReason = "remaining") => {
      setPartialRemaining(Math.max(0, remainingCount));
      setPartialReason(reason);
      setLimitModalVariant("partial");
      setIsLimitOpen(true);
    },
    []
  );

  const requestActionSlots = useCallback(
    async (count: number): Promise<ActionSlotsResult> => {
      const normalizedCount = Math.max(0, Math.floor(count));

      if (normalizedCount === 0) {
        return { ok: false, allowedCount: 0, remaining: status?.remaining ?? 0 };
      }

      if (hasPremiumAccess) {
        return {
          ok: true,
          allowedCount: normalizedCount,
          remaining: Number.POSITIVE_INFINITY,
        };
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

        return {
          ok: result.authorized,
          allowedCount: result.allowedCount,
          remaining: result.remaining,
        };
      })();

      authorizeInFlightRef.current = pending;

      try {
        return await pending;
      } finally {
        authorizeInFlightRef.current = null;
      }
    },
    [hasPremiumAccess, status?.remaining]
  );

  const handleResetComplete = useCallback(async () => {
    await syncSessionsAndRefresh();
    setIsLimitOpen(false);
  }, [syncSessionsAndRefresh]);

  const closeLimitModal = useCallback(() => {
    setIsLimitOpen(false);
  }, []);

  const isStatusReady = status !== null || hasPremiumAccess;

  const remaining =
    hasPremiumAccess || status?.isPremium
      ? Number.POSITIVE_INFINITY
      : isStatusReady
        ? (status?.remaining ?? 0)
        : 0;

  const resetAt = status?.resetAt ?? null;

  const modalRemaining =
    limitModalVariant === "partial"
      ? partialRemaining
      : (status?.remaining ?? 0);

  const value = useMemo(
    () => ({
      status,
      isStatusReady,
      remaining,
      resetAt,
      refreshStatus,
      requestActionSlots,
      showExhaustedLimitModal,
      showPartialLimitModal,
    }),
    [
      isStatusReady,
      remaining,
      refreshStatus,
      requestActionSlots,
      resetAt,
      showExhaustedLimitModal,
      showPartialLimitModal,
      status,
    ]
  );

  return (
    <DownloadLimitContext.Provider value={value}>
      {children}
      <DailyDownloadLimitModal
        open={isLimitOpen}
        variant={limitModalVariant}
        partialReason={partialReason}
        resetAt={resetAt}
        remaining={modalRemaining}
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
