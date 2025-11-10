import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Allow the login page itself
  if (req.nextUrl.pathname === "/admin/login") return NextResponse.next();

  // Read cookie
  const isAdmin = req.cookies.get("isAdmin")?.value === "true";

  // If not admin, redirect to login
  if (!isAdmin) {
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise allow access
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"], // apply to all /admin routes
};
