import { type NextRequest, NextResponse } from "next/server";

/** Must match AUTH_COOKIE in backend/src/auth/auth.constants.ts */
const AUTH_COOKIE = "pushpace_token";

/**
 * Optimistic check only: sends visitors with no auth cookie to /login before
 * any page renders. The token itself is verified by the API (`/api/auth/me`).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has(AUTH_COOKIE)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/walking/:path*", "/gym/:path*", "/running/:path*"],
};
