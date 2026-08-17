/** Anonymous users — shared Copy + Download actions per day. */
export const ANONYMOUS_DAILY_ACTION_LIMIT = 5;

/** Signed-up users — shared Copy + Download actions per day. */
export const SIGNED_IN_DAILY_ACTION_LIMIT = 8;

/** @deprecated Use tier-specific limits — kept for legacy imports. */
export const DAILY_DOWNLOAD_LIMIT = ANONYMOUS_DAILY_ACTION_LIMIT;

/** Local calendar date key for the user's timezone offset (minutes). */
export function getLocalPeriodKey(
  timezoneOffsetMinutes: number,
  now = new Date()
): string {
  const localMs = now.getTime() - timezoneOffsetMinutes * 60 * 1000;
  const local = new Date(localMs);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, "0");
  const day = String(local.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** UTC timestamp when the user's local daily allowance resets (next local midnight). */
export function getNextResetTimestamp(
  timezoneOffsetMinutes: number,
  now = new Date()
): number {
  const localMs = now.getTime() - timezoneOffsetMinutes * 60 * 1000;
  const local = new Date(localMs);
  const nextLocalMidnightUtc = Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() + 1,
    0,
    0,
    0,
    0
  );
  return nextLocalMidnightUtc + timezoneOffsetMinutes * 60 * 1000;
}

export function getRemainingMsUntilReset(
  timezoneOffsetMinutes: number,
  now = new Date()
): number {
  return Math.max(0, getNextResetTimestamp(timezoneOffsetMinutes, now) - now.getTime());
}

/** `08h 42m 17s` */
export function formatDownloadResetCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function getClientTimezoneOffsetMinutes(): number {
  return new Date().getTimezoneOffset();
}

export function resolveDailyActionLimit(
  isPremium: boolean,
  isSignedIn: boolean
): number {
  if (isPremium) {
    return SIGNED_IN_DAILY_ACTION_LIMIT;
  }

  return isSignedIn
    ? SIGNED_IN_DAILY_ACTION_LIMIT
    : ANONYMOUS_DAILY_ACTION_LIMIT;
}
