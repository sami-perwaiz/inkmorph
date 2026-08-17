/** @deprecated Use `@/lib/dailyDownloadReset` — kept for existing imports. */
export {
  ANONYMOUS_DAILY_ACTION_LIMIT,
  DAILY_DOWNLOAD_LIMIT,
  SIGNED_IN_DAILY_ACTION_LIMIT,
  formatDownloadResetCountdown,
  getClientTimezoneOffsetMinutes,
  getLocalPeriodKey,
  getNextResetTimestamp,
  getRemainingMsUntilReset,
  resolveDailyActionLimit,
} from "@/lib/dailyDownloadReset";

export {
  authorizeDownloadSlots,
  clearPremiumDownloadSession,
  clearSignedInDownloadSession,
  fetchDownloadLimitStatus,
  syncPremiumDownloadSession,
  syncSignedInDownloadSession,
  type AuthorizeDownloadsResult,
  type DownloadLimitStatus,
} from "@/lib/downloadLimitApi";
