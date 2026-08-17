import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getCategoryHref } from "@/lib/seo/routes";
import type { FilterValue } from "@/types/illustration";

/** Force HTTPS in production — fixes "connection not secure" when users hit HTTP URLs. */
export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    const forwardedProto = request.headers.get("x-forwarded-proto");
    if (forwardedProto === "http") {
      const host = request.headers.get("host") ?? request.nextUrl.host;
      const destination = `https://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
      return NextResponse.redirect(destination, 301);
    }
  }

  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/") {
    const filter = searchParams.get("filter");
    if (filter && filter !== "all") {
      const destination = new URL(getCategoryHref(filter as FilterValue), request.url);
      return NextResponse.redirect(destination, 301);
    }

    if (filter === "all") {
      const destination = new URL("/", request.url);
      destination.searchParams.delete("filter");
      if (destination.search !== request.nextUrl.search) {
        return NextResponse.redirect(destination, 301);
      }
    }
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    const destination = new URL(pathname.slice(0, -1), request.url);
    destination.search = request.nextUrl.search;
    return NextResponse.redirect(destination, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|woff2?)$).*)",
  ],
};
