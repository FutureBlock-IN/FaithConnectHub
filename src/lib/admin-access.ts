/**
 * Temporary super-admin access for testing.
 * Replace `resolveIsAdmin` with Firestore role checks when ready.
 */
export const SUPER_ADMIN_EMAIL = "futureblock07@gmail.com";

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}

/** Single entry point for admin checks — swap implementation later. */
export function resolveIsAdmin(email: string | null | undefined): boolean {
  return isSuperAdminEmail(email);
}

export const ADMIN_ROUTE_PREFIXES = [
  "/admin-worship-panel",
  "/admin-panel",
  "/admin",
] as const;

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
