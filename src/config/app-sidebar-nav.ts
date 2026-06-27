import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  Building2,
  CalendarDays,
  Clock,
  CreditCard,
  Heart,
  HeartHandshake,
  Home,
  LayoutDashboard,
  ListChecks,
  Mic2,
  Music,
  Settings,
  Sparkles,
  Tag,
  Users,
} from "lucide-react";

import { MULTI_CHURCH_ENABLED } from "@/lib/feature-flags";

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  match: (pathname: string) => boolean;
  superAdminOnly?: boolean;
  /** Only shown when the user is signed in. */
  authOnly?: boolean;
};

export type AppNavGroup = {
  label?: string;
  items: AppNavItem[];
  /** Renders a divider above this group (e.g. admin workspace). */
  separated?: boolean;
};

const exact = (href: string) => (pathname: string) => pathname === href;
const startsWith = (href: string) => (pathname: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

const ADMIN_BASE = "/admin-worship-panel";

const matchesAdminContent = (pathname: string) =>
  pathname.startsWith(`${ADMIN_BASE}/content`) ||
  pathname.startsWith(`${ADMIN_BASE}/songs`) ||
  pathname.startsWith(`${ADMIN_BASE}/sermons`) ||
  pathname.startsWith(`${ADMIN_BASE}/articles`) ||
  pathname.startsWith(`${ADMIN_BASE}/events`) ||
  pathname.startsWith(`${ADMIN_BASE}/donations`) ||
  pathname.startsWith(`${ADMIN_BASE}/prayers`);

/** Primary navigation groups shown to everyone. */
export const APP_NAV_GROUPS: AppNavGroup[] = [
  {
    label: "Public Navigation",
    items: [
      { label: "Home", href: "/", icon: Home, match: exact("/") },
      { label: "Pricing", href: "/pricing", icon: Tag, match: startsWith("/pricing") },
      { label: "Songs", href: "/songs", icon: Music, match: startsWith("/songs") },
      { label: "Sermons", href: "/sermons", icon: Mic2, match: startsWith("/sermons") },
      {
        label: "Articles",
        href: "/articles",
        icon: BookOpen,
        match: startsWith("/articles"),
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        label: "Prayer Requests",
        href: "/prayer-requests",
        icon: Sparkles,
        match: startsWith("/prayer-requests"),
      },
      { label: "Events", href: "/events", icon: CalendarDays, match: startsWith("/events") },
      {
        label: "Donations",
        href: "/donations",
        icon: HeartHandshake,
        match: startsWith("/donations"),
      },
    ],
  },
];

/** Personal library — only rendered for signed-in users. */
export function getLibraryNavGroup(): AppNavGroup {
  return {
    label: "Library",
    items: [
      {
        label: "Favorites",
        href: "/favorites",
        icon: Heart,
        match: startsWith("/favorites"),
        authOnly: true,
      },
      {
        label: "Recently Viewed",
        href: "/recently-viewed",
        icon: Clock,
        match: startsWith("/recently-viewed"),
        authOnly: true,
      },
    ],
  };
}

/** Admin workspace — only rendered for admin users. */
export function getAdminNavGroup(): AppNavGroup {
  const items: AppNavItem[] = [
    {
      label: "Dashboard",
      href: ADMIN_BASE,
      icon: LayoutDashboard,
      match: exact(ADMIN_BASE),
    },
    {
      label: "Content",
      href: `${ADMIN_BASE}/content`,
      icon: ListChecks,
      match: matchesAdminContent,
    },
    {
      label: "Analytics",
      href: `${ADMIN_BASE}/analytics`,
      icon: BarChart3,
      match: startsWith(`${ADMIN_BASE}/analytics`),
    },
    {
      label: "Billing",
      href: `${ADMIN_BASE}/billing`,
      icon: CreditCard,
      match: startsWith(`${ADMIN_BASE}/billing`),
    },
    {
      label: "Users",
      href: `${ADMIN_BASE}/users`,
      icon: Users,
      match: startsWith(`${ADMIN_BASE}/users`),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Settings,
      match: startsWith("/settings"),
    },
  ];

  if (MULTI_CHURCH_ENABLED) {
    items.splice(4, 0, {
      label: "Churches",
      href: `${ADMIN_BASE}/churches`,
      icon: Building2,
      match: startsWith(`${ADMIN_BASE}/churches`),
      superAdminOnly: true,
    });
  }

  return {
    label: "Admin Workspace",
    separated: true,
    items,
  };
}

/** @deprecated Use getAdminNavGroup() for dynamic super-admin items. */
export const APP_ADMIN_NAV_GROUP = getAdminNavGroup();

/** All navigable items for breadcrumb / title resolution. */
export function getAllAppNavItems(): AppNavItem[] {
  return [
    ...APP_NAV_GROUPS.flatMap((group) => group.items),
    ...getLibraryNavGroup().items,
    ...getAdminNavGroup().items,
  ];
}

/** Best matching nav item for the current path (longest href wins). */
export function getActiveNavItem(pathname: string): AppNavItem | null {
  return (
    getAllAppNavItems()
      .filter((item) => item.match(pathname))
      .sort((a, b) => b.href.length - a.href.length)[0] ?? null
  );
}

/** Group label for the active nav item, if any. */
export function getActiveNavGroupLabel(pathname: string): string | undefined {
  const active = getActiveNavItem(pathname);
  if (!active) return undefined;

  for (const group of [...APP_NAV_GROUPS, getLibraryNavGroup(), getAdminNavGroup()]) {
    if (group.items.some((item) => item.href === active.href)) {
      return group.label;
    }
  }

  return undefined;
}
