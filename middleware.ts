import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Force HTTPS in production — fixes "connection not secure" when users hit HTTP URLs. */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto !== "http") {
    return NextResponse.next();
  }

  const host = request.headers.get("host") ?? request.nextUrl.host;
  const destination = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;

  return NextResponse.redirect(destination, 301);
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static files.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?)$).*)",
  ],
};
