import { NextResponse } from "next/server";

import { setPremiumDownloadSession } from "@/lib/dailyDownloadLimitServer";
import { isTestingPremiumUser } from "@/lib/testingPremiumAccess";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as {
    active?: boolean;
    email?: string | null;
  };

  if (body.active) {
    if (!isTestingPremiumUser(body.email)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    await setPremiumDownloadSession(true, body.email);
    return NextResponse.json({ ok: true });
  }

  await setPremiumDownloadSession(false);
  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  await setPremiumDownloadSession(false);
  return NextResponse.json({ ok: true });
}
