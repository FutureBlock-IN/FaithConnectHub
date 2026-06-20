import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import { isAdminRoute } from "@/lib/admin-access";
import {
  AUTH_ADMIN_COOKIE_NAME as ADMIN_COOKIE,
  AUTH_COOKIE_NAME as AUTH_COOKIE,
} from "@/lib/auth-cookies";

const AUTH_ONLY_PATHS = ["/signin", "/signup", "/forgot-password"];

/**
 * Protected route prefixes. A request is protected when its path equals the
 * prefix or starts with `${prefix}/`. Content detail routes (songs/sermons/
 * articles) have no public list page, so the whole prefix is protected.
 */
const PROTECTED_PREFIXES = [
  "/songs",
  "/sermons",
  "/articles",
  "/profile",
  "/favorites",
  "/groups",
  "/dashboard",
];

function isPathMatch(pathname: string, paths: string[]) {
  return paths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

/**
 * Prayer requests list/preview (`/prayer-requests`) stays public, but every
 * sub-route — detail (`/prayer-requests/[id]`) and submit — requires auth.
 */
function isProtectedPath(pathname: string) {
  if (isPathMatch(pathname, PROTECTED_PREFIXES)) return true;
  if (pathname.startsWith("/prayer-requests/")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAuthenticated = req.cookies.has(AUTH_COOKIE);
  const isAdmin = req.cookies.has(ADMIN_COOKIE);

  // Redirect authenticated users away from auth pages
  if (AUTH_ONLY_PATHS.some((path) => pathname === path)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Admin-only routes (temporary email-based access via cookie)
  if (isAdminRoute(pathname)) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // Protected routes — redirect to /signin if not authenticated, preserving
  // the intended destination so login can return the user to it.
  if (isProtectedPath(pathname)) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", `${pathname}${req.nextUrl.search}`);
      return NextResponse.redirect(signInUrl);
    }
    return NextResponse.next();
  }

  // Public routes and everything else (home, search, previews, list pages)
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon|icon\\.png|apple-icon|images|robots.txt|manifest\\.webmanifest).*)",
  ],
};
