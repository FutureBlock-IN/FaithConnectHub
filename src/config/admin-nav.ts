import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Building2,
  CreditCard,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";

import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  superAdminOnly?: boolean;
};

const BASE = "/admin-worship-panel";

const matchesAdminContent = (pathname: string) =>
  pathname.startsWith(`${BASE}/content`) ||
  pathname.startsWith(`${BASE}/songs`) ||
  pathname.startsWith(`${BASE}/sermons`) ||
  pathname.startsWith(`${BASE}/articles`) ||
  pathname.startsWith(`${BASE}/events`) ||
  pathname.startsWith(`${BASE}/donations`) ||
  pathname.startsWith(`${BASE}/prayers`);

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    href: BASE,
    label: "Dashboard",
    icon: LayoutDashboard,
    match: (pathname) => pathname === BASE,
  },
  {
    href: `${BASE}/content`,
    label: "Content",
    icon: ListChecks,
    match: matchesAdminContent,
  },
  {
    href: `${BASE}/analytics`,
    label: "Analytics",
    icon: BarChart3,
    match: (pathname) => pathname.startsWith(`${BASE}/analytics`),
  },
  {
    href: `${BASE}/billing`,
    label: "Billing",
    icon: CreditCard,
    match: (pathname) => pathname.startsWith(`${BASE}/billing`),
  },
  {
    href: `${BASE}/users`,
    label: "Users",
    icon: Users,
    match: (pathname) => pathname.startsWith(`${BASE}/users`),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    match: (pathname) => pathname.startsWith("/settings"),
  },
  ...(MULTI_CHURCH_ENABLED
    ? [
        {
          href: `${BASE}/churches`,
          label: "Churches",
          icon: Building2,
          match: (pathname: string) => pathname.startsWith(`${BASE}/churches`),
          superAdminOnly: true,
        } satisfies AdminNavItem,
      ]
    : []),
];
