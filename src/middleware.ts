import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("__session");

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/settings") ||
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/meetings");

  if (isProtectedRoute && !session) {
    const redirectUrl = new URL("/auth", request.url);

    return NextResponse.redirect(redirectUrl);
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL("/meetings", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/settings/:path*",
    "/dashboard/:path*",
    "/meetings/:path*",
    "/auth/:path*",
  ],
};
