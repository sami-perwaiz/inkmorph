import { NextResponse } from "next/server";

import { setPremiumDownloadSession } from "@/lib/dailyDownloadLimitServer";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as {
    active?: boolean;
    email?: string | null;
  };

  if (body.active) {
    // Checkout not live — reject premium session activation.
    await setPremiumDownloadSession(false);
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  await setPremiumDownloadSession(false);
  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  await setPremiumDownloadSession(false);
  return NextResponse.json({ ok: true });
}
