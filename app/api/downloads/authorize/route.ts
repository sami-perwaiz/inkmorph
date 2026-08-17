import { NextResponse } from "next/server";

import { authorizeDownloads } from "@/lib/dailyDownloadLimitServer";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as {
    count?: number;
    timezoneOffsetMinutes?: number;
  };

  const count = typeof body.count === "number" ? body.count : 1;
  const timezoneOffsetMinutes =
    typeof body.timezoneOffsetMinutes === "number"
      ? body.timezoneOffsetMinutes
      : 0;

  const result = await authorizeDownloads(count, timezoneOffsetMinutes);
  return NextResponse.json(result);
}
