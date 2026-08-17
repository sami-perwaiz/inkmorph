/** @deprecated Use `@/lib/dailyDownloadReset` — kept for existing imports. */
export {
  DAILY_DOWNLOAD_LIMIT,
  formatDownloadResetCountdown,
  getClientTimezoneOffsetMinutes,
  getLocalPeriodKey,
  getNextResetTimestamp,
  getRemainingMsUntilReset,
} from "@/lib/dailyDownloadReset";

export {
  authorizeDownloadSlots,
  clearPremiumDownloadSession,
  fetchDownloadLimitStatus,
  syncPremiumDownloadSession,
  type AuthorizeDownloadsResult,
  type DownloadLimitStatus,
} from "@/lib/downloadLimitApi";
