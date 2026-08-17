import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import {
  DAILY_DOWNLOAD_LIMIT,
  getLocalPeriodKey,
  getNextResetTimestamp,
} from "@/lib/dailyDownloadReset";

const DOWNLOAD_COOKIE = "inkmorph-dl-limit";
const PREMIUM_COOKIE = "inkmorph-dl-premium";

interface DownloadLimitPayload {
  periodKey: string;
  count: number;
}

export interface DownloadLimitStatus {
  limit: number;
  used: number;
  remaining: number;
  resetAt: number;
  isPremium: boolean;
}

function getSecret(): string {
  return (
    process.env.DOWNLOAD_LIMIT_SECRET ??
    "inkmorph-dev-download-limit-secret-change-me"
  );
}

function sign(value: string): string {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodeSignedPayload(payload: DownloadLimitPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${body}.${sign(body)}`;
}

function decodeSignedPayload(raw: string | undefined): DownloadLimitPayload | null {
  if (!raw) {
    return null;
  }

  const [body, signature] = raw.split(".");
  if (!body || !signature) {
    return null;
  }

  const expected = sign(body);
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8")
    ) as Partial<DownloadLimitPayload>;

    if (
      typeof parsed.periodKey !== "string" ||
      typeof parsed.count !== "number" ||
      !Number.isFinite(parsed.count) ||
      parsed.count < 0
    ) {
      return null;
    }

    return {
      periodKey: parsed.periodKey,
      count: Math.floor(parsed.count),
    };
  } catch {
    return null;
  }
}

async function readPremiumCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(PREMIUM_COOKIE)?.value;
  return raw === sign("premium-active");
}

async function readDownloadPayload(
  timezoneOffsetMinutes: number
): Promise<DownloadLimitPayload> {
  const cookieStore = await cookies();
  const decoded = decodeSignedPayload(cookieStore.get(DOWNLOAD_COOKIE)?.value);
  const periodKey = getLocalPeriodKey(timezoneOffsetMinutes);

  if (!decoded || decoded.periodKey !== periodKey) {
    return { periodKey, count: 0 };
  }

  return {
    periodKey,
    count: Math.min(decoded.count, DAILY_DOWNLOAD_LIMIT),
  };
}

async function writeDownloadPayload(payload: DownloadLimitPayload): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(DOWNLOAD_COOKIE, encodeSignedPayload(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 2,
  });
}

export async function setPremiumDownloadSession(active: boolean): Promise<void> {
  const cookieStore = await cookies();

  if (!active) {
    cookieStore.delete(PREMIUM_COOKIE);
    return;
  }

  cookieStore.set(PREMIUM_COOKIE, sign("premium-active"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getDownloadLimitStatus(
  timezoneOffsetMinutes: number
): Promise<DownloadLimitStatus> {
  const isPremium = await readPremiumCookie();
  const resetAt = getNextResetTimestamp(timezoneOffsetMinutes);

  if (isPremium) {
    return {
      limit: DAILY_DOWNLOAD_LIMIT,
      used: 0,
      remaining: DAILY_DOWNLOAD_LIMIT,
      resetAt,
      isPremium: true,
    };
  }

  const payload = await readDownloadPayload(timezoneOffsetMinutes);
  const used = Math.min(payload.count, DAILY_DOWNLOAD_LIMIT);
  const remaining = Math.max(0, DAILY_DOWNLOAD_LIMIT - used);

  return {
    limit: DAILY_DOWNLOAD_LIMIT,
    used,
    remaining,
    resetAt,
    isPremium: false,
  };
}

export interface AuthorizeDownloadsResult {
  authorized: boolean;
  allowedCount: number;
  limit: number;
  used: number;
  remaining: number;
  resetAt: number;
  isPremium: boolean;
}

export async function authorizeDownloads(
  requestedCount: number,
  timezoneOffsetMinutes: number
): Promise<AuthorizeDownloadsResult> {
  const count = Math.max(0, Math.floor(requestedCount));
  const resetAt = getNextResetTimestamp(timezoneOffsetMinutes);
  const isPremium = await readPremiumCookie();

  if (isPremium) {
    return {
      authorized: true,
      allowedCount: count,
      limit: DAILY_DOWNLOAD_LIMIT,
      used: 0,
      remaining: DAILY_DOWNLOAD_LIMIT,
      resetAt,
      isPremium: true,
    };
  }

  const payload = await readDownloadPayload(timezoneOffsetMinutes);
  const used = Math.min(payload.count, DAILY_DOWNLOAD_LIMIT);
  const remaining = Math.max(0, DAILY_DOWNLOAD_LIMIT - used);

  if (count === 0) {
    return {
      authorized: false,
      allowedCount: 0,
      limit: DAILY_DOWNLOAD_LIMIT,
      used,
      remaining,
      resetAt,
      isPremium: false,
    };
  }

  if (count > remaining) {
    return {
      authorized: false,
      allowedCount: 0,
      limit: DAILY_DOWNLOAD_LIMIT,
      used,
      remaining,
      resetAt,
      isPremium: false,
    };
  }

  const nextPayload: DownloadLimitPayload = {
    periodKey: payload.periodKey,
    count: used + count,
  };

  await writeDownloadPayload(nextPayload);

  return {
    authorized: true,
    allowedCount: count,
    limit: DAILY_DOWNLOAD_LIMIT,
    used: nextPayload.count,
    remaining: Math.max(0, DAILY_DOWNLOAD_LIMIT - nextPayload.count),
    resetAt,
    isPremium: false,
  };
}
