import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Don't block the login page itself
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  // Read client-side flag from cookie or localStorage token (we'll use a cookie)
  const isAdmin = req.cookies.get("isAdmin")?.value === "true";

  if (!isAdmin) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Apply to all admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
