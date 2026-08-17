import { NextResponse } from "next/server";

import { setPremiumDownloadSession } from "@/lib/dailyDownloadLimitServer";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as { active?: boolean };
  await setPremiumDownloadSession(Boolean(body.active));
  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  await setPremiumDownloadSession(false);
  return NextResponse.json({ ok: true });
}
