import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for Firebase auth session cookie
  const session = request.cookies.get("__session");

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  // Add any other protected routes here
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/meetings");

  // Redirect to auth if accessing protected route without session
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth", request.url);

    return NextResponse.redirect(redirectUrl);
  }

  // Redirect to meetings (Change to dashboard or base page later) if accessing auth page with session
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/meetings", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add all routes that need auth checking
    "/settings/:path*",
    "/dashboard/:path*",
    "/meetings/:path*",
    "/auth/:path*",
  ],
};
