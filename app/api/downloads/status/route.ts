import { NextResponse } from "next/server";

import { getDownloadLimitStatus } from "@/lib/dailyDownloadLimitServer";

export async function GET(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const offsetParam = searchParams.get("timezoneOffsetMinutes");
  const timezoneOffsetMinutes =
    offsetParam !== null && Number.isFinite(Number(offsetParam))
      ? Number(offsetParam)
      : 0;

  const status = await getDownloadLimitStatus(timezoneOffsetMinutes);
  return NextResponse.json(status);
}
