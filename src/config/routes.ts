/**
 * Public routes — accessible without authentication.
 * Includes the prayer requests list/preview page; its sub-routes are protected.
 */
export const publicRoutes = [
  "/",
  "/about",
  "/privacy",
  "/search",
  "/signin",
  "/signup",
  "/forgot-password",
  "/prayer-requests",
  "/events",
  "/donations",
  "/songs",
  "/sermons",
  "/articles",
];

/**
 * Auth routes — redirect authenticated users to home
 */
export const authRoutes = ["/signin", "/signup", "/forgot-password"];

/**
 * Protected route prefixes — require authentication.
 * Note: `/prayer-requests/*` (detail + submit) is protected separately in
 * middleware so the bare `/prayer-requests` list stays public.
 */
export const protectedRoutes = [
  "/songs",
  "/sermons",
  "/articles",
  "/profile",
  "/favorites",
  "/groups",
  "/dashboard",
  "/prayer-requests/submit",
];

/**
 * Content detail routes — require authentication to view (home browsing stays public)
 */
export const contentDetailPrefixes = ["/songs", "/articles", "/sermons"];

/**
 * Admin-only routes — require super-admin email (temporary testing mode)
 */
export const adminRoutes = [
  "/admin-worship-panel",
  "/admin-panel",
  "/admin",
];

/**
 * Default redirect after login
 */
export const DEFAULT_LOGIN_REDIRECT = "/";
