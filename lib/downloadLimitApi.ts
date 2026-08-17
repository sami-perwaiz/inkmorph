"use client";

import {
  DAILY_DOWNLOAD_LIMIT,
  getClientTimezoneOffsetMinutes,
} from "@/lib/dailyDownloadReset";

export interface DownloadLimitStatus {
  limit: number;
  used: number;
  remaining: number;
  resetAt: number;
  isPremium: boolean;
}

export interface AuthorizeDownloadsResult extends DownloadLimitStatus {
  authorized: boolean;
  allowedCount: number;
}

const DEFAULT_STATUS: DownloadLimitStatus = {
  limit: DAILY_DOWNLOAD_LIMIT,
  used: 0,
  remaining: DAILY_DOWNLOAD_LIMIT,
  resetAt: Date.now() + 60 * 60 * 1000,
  isPremium: false,
};

export async function fetchDownloadLimitStatus(): Promise<DownloadLimitStatus> {
  const timezoneOffsetMinutes = getClientTimezoneOffsetMinutes();
  const response = await fetch(
    `/api/downloads/status?timezoneOffsetMinutes=${timezoneOffsetMinutes}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return DEFAULT_STATUS;
  }

  return (await response.json()) as DownloadLimitStatus;
}

export async function authorizeDownloadSlots(
  count: number
): Promise<AuthorizeDownloadsResult> {
  const timezoneOffsetMinutes = getClientTimezoneOffsetMinutes();
  const response = await fetch("/api/downloads/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ count, timezoneOffsetMinutes }),
  });

  if (!response.ok) {
    const status = await fetchDownloadLimitStatus();
    return {
      ...status,
      authorized: false,
      allowedCount: 0,
    };
  }

  return (await response.json()) as AuthorizeDownloadsResult;
}

export async function syncPremiumDownloadSession(active: boolean): Promise<void> {
  await fetch("/api/downloads/premium", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active }),
  }).catch(() => {
    // Non-blocking — client premium state still applies for UI.
  });
}

export async function clearPremiumDownloadSession(): Promise<void> {
  await fetch("/api/downloads/premium", { method: "DELETE" }).catch(() => {
    // Ignore network failures during sign-out.
  });
}
