// before: middleware.ts (Edge runtime)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function wantsJson(req: NextRequest) {
  const accept = req.headers.get("accept") || "";
  return accept.includes("application/json") || req.nextUrl.pathname.startsWith("/admin/api");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Run middleware only for /admin/*
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // Always allow the login page and static assets under /admin
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/_next") ||
    pathname.startsWith("/admin/static") ||
    pathname === "/admin/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Let CORS preflight pass cleanly
  if (req.method === "OPTIONS") return NextResponse.next();

  // Check admin auth cookie (set this after successful login)
  const isAdmin = req.cookies.get("isAdmin")?.value === "true";

  if (!isAdmin) {
    if (wantsJson(req)) {
      // For admin API calls, send JSON 401 (avoid HTML redirect in fetch)
      return NextResponse.json(
        { error: "unauthorized", code: "admin_auth_required" },
        { status: 401 }
      );
    }
    // For normal page requests, redirect to the login screen
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname); // optional: return after login
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Only match admin routes (public routes like /entry and /api/entry/** stay untouched)
export const config = {
  matcher: ["/admin/:path*"],
};
