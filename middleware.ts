import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

/**
 * Middleware runs at the edge before any React rendering
 * Note: Authentication checks now happen client-side via AuthGuard
 * since tokens are stored in localStorage (not accessible in edge middleware)
 */
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// Apply middleware to relevant routes (minimal, mostly for logging/analytics)
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
