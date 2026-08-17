import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

import {
  getLocalPeriodKey,
  getNextResetTimestamp,
  resolveDailyActionLimit,
  SIGNED_IN_DAILY_ACTION_LIMIT,
} from "@/lib/dailyDownloadReset";

const ACTION_COOKIE = "inkmorph-dl-limit";
const PREMIUM_COOKIE = "inkmorph-dl-premium";
const SIGNED_IN_COOKIE = "inkmorph-dl-signed-in";

interface ActionLimitPayload {
  periodKey: string;
  count: number;
}

export interface DownloadLimitStatus {
  limit: number;
  used: number;
  remaining: number;
  resetAt: number;
  isPremium: boolean;
  isSignedIn: boolean;
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

function encodeSignedPayload(payload: ActionLimitPayload): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url"
  );
  return `${body}.${sign(body)}`;
}

function decodeSignedPayload(raw: string | undefined): ActionLimitPayload | null {
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
    ) as Partial<ActionLimitPayload>;

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

async function readSignedInCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SIGNED_IN_COOKIE)?.value;
  return raw === sign("signed-in-active");
}

async function readActionPayload(
  timezoneOffsetMinutes: number
): Promise<ActionLimitPayload> {
  const cookieStore = await cookies();
  const decoded = decodeSignedPayload(cookieStore.get(ACTION_COOKIE)?.value);
  const periodKey = getLocalPeriodKey(timezoneOffsetMinutes);

  if (!decoded || decoded.periodKey !== periodKey) {
    return { periodKey, count: 0 };
  }

  return {
    periodKey,
    count: decoded.count,
  };
}

async function writeActionPayload(payload: ActionLimitPayload): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACTION_COOKIE, encodeSignedPayload(payload), {
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

export async function setSignedInDownloadSession(active: boolean): Promise<void> {
  const cookieStore = await cookies();

  if (!active) {
    cookieStore.delete(SIGNED_IN_COOKIE);
    return;
  }

  cookieStore.set(SIGNED_IN_COOKIE, sign("signed-in-active"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

function buildStatus(
  payload: ActionLimitPayload,
  timezoneOffsetMinutes: number,
  isPremium: boolean,
  isSignedIn: boolean
): DownloadLimitStatus {
  const resetAt = getNextResetTimestamp(timezoneOffsetMinutes);
  const limit = resolveDailyActionLimit(isPremium, isSignedIn);
  const used = payload.count;

  if (isPremium) {
    return {
      limit,
      used: 0,
      remaining: limit,
      resetAt,
      isPremium: true,
      isSignedIn,
    };
  }

  const remaining = Math.max(0, limit - used);

  return {
    limit,
    used,
    remaining,
    resetAt,
    isPremium: false,
    isSignedIn,
  };
}

export async function getDownloadLimitStatus(
  timezoneOffsetMinutes: number
): Promise<DownloadLimitStatus> {
  const isPremium = await readPremiumCookie();
  const isSignedIn = await readSignedInCookie();
  const payload = await readActionPayload(timezoneOffsetMinutes);
  return buildStatus(payload, timezoneOffsetMinutes, isPremium, isSignedIn);
}

export interface AuthorizeDownloadsResult {
  authorized: boolean;
  allowedCount: number;
  limit: number;
  used: number;
  remaining: number;
  resetAt: number;
  isPremium: boolean;
  isSignedIn: boolean;
}

export async function authorizeDownloads(
  requestedCount: number,
  timezoneOffsetMinutes: number
): Promise<AuthorizeDownloadsResult> {
  const count = Math.max(0, Math.floor(requestedCount));
  const isPremium = await readPremiumCookie();
  const isSignedIn = await readSignedInCookie();
  const payload = await readActionPayload(timezoneOffsetMinutes);
  const status = buildStatus(
    payload,
    timezoneOffsetMinutes,
    isPremium,
    isSignedIn
  );

  if (isPremium) {
    return {
      authorized: true,
      allowedCount: count,
      ...status,
    };
  }

  if (count === 0 || count > status.remaining) {
    return {
      authorized: false,
      allowedCount: 0,
      ...status,
    };
  }

  const nextPayload: ActionLimitPayload = {
    periodKey: payload.periodKey,
    count: payload.count + count,
  };

  await writeActionPayload(nextPayload);

  const nextStatus = buildStatus(
    nextPayload,
    timezoneOffsetMinutes,
    isPremium,
    isSignedIn
  );

  return {
    authorized: true,
    allowedCount: count,
    ...nextStatus,
  };
}

export { SIGNED_IN_DAILY_ACTION_LIMIT };
