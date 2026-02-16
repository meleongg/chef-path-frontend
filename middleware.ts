import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware runs at the edge before any React rendering
 * This eliminates client-side flicker by handling redirects server-side
 */
export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("chefpath_refresh");
  const { pathname } = request.nextUrl;

  // Redirect logged-in users away from landing page to their dashboard
  if (refreshToken && pathname === "/") {
    return NextResponse.redirect(new URL("/weekly-plan", request.url));
  }

  // Redirect logged-out users away from protected routes to login
  // Note: Protected routes use (protected) directory but Next.js serves them without the parens
  if (
    !refreshToken &&
    pathname.match(/^\/(analytics|onboarding|recipe|settings|weekly-plan)/)
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Apply middleware only to relevant routes
export const config = {
  matcher: [
    "/",
    "/analytics/:path*",
    "/onboarding/:path*",
    "/recipe/:path*",
    "/settings/:path*",
    "/weekly-plan/:path*",
  ],
};
