import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/domain/constants";

const LANDING_PATH = "/";

export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value);

  if (hasSession) {
    return NextResponse.next();
  }

  const destination = request.nextUrl.clone();
  destination.pathname = LANDING_PATH;
  destination.search = "";

  const nextTarget = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextTarget !== LANDING_PATH) {
    destination.searchParams.set("next", nextTarget);
  }

  return NextResponse.redirect(destination);
}

export const config = {
  matcher: [
    "/mata/:path*",
    "/gist/:path*",
    "/alerts/:path*",
    "/score/:path*",
    "/locker/:path*",
    "/drop/:path*",
    "/support/:path*",
    "/contact-oga/:path*",
  ],
};
