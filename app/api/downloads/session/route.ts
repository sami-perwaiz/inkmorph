import { NextResponse } from "next/server";

import { setSignedInDownloadSession } from "@/lib/dailyDownloadLimitServer";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as { signedIn?: boolean };
  await setSignedInDownloadSession(Boolean(body.signedIn));
  return NextResponse.json({ ok: true });
}

export async function DELETE(): Promise<NextResponse> {
  await setSignedInDownloadSession(false);
  return NextResponse.json({ ok: true });
}
