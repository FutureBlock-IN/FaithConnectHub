/**
 * Public routes — accessible without authentication
 */
export const publicRoutes = ["/", "/about", "/privacy", "/signin", "/signup", "/forgot-password"];

/**
 * Auth routes — redirect authenticated users to home
 */
export const authRoutes = ["/signin", "/signup", "/forgot-password"];

/**
 * Protected routes — require authentication
 */
export const protectedRoutes = ["/groups", "/profile", "/events", "/dashboard"];

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
